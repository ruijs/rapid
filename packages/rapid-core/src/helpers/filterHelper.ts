import {
  EntityFilterOptions,
  EntityNonRelationPropertyFilterOptions,
  FindEntityExistenceFilterOptions,
  FindEntityLogicalFilterOptions,
  RpdDataModel,
  RpdDataModelIndexOptions,
  RpdDataModelProperty,
} from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { getEntityOwnProperty, getEntityOwnPropertyByCode, isManyRelationProperty, isOneRelationProperty } from "./metaHelper";
import { IRpdServer } from "~/core/server";
import { isPlainObject } from "lodash";
import { RowFilterOptions } from "~/dataAccess/dataAccessTypes";
import { Logger } from "~/facilities/log/LogFacility";

export function removeFiltersWithNullValue(filters?: EntityFilterOptions[]) {
  const result: EntityFilterOptions[] = [];
  if (!filters) {
    return result;
  }

  for (const filter of filters) {
    const { operator } = filter;

    switch (operator) {
      case "null":
      case "notNull":
        result.push(filter);
        break;
      case "exists":
      case "notExists":
      case "and":
      case "or":
        const transformedFilter = transformFilterWithSubFilters(filter);
        if (transformedFilter !== null) {
          result.push(transformedFilter);
        }
        break;
      default:
        if (!isNullOrUndefined(filter.value)) {
          result.push(filter);
        }
    }
  }

  return result;
}

function transformFilterWithSubFilters(
  filter: FindEntityExistenceFilterOptions | FindEntityLogicalFilterOptions,
): FindEntityExistenceFilterOptions | FindEntityLogicalFilterOptions | null {
  const subFilters = removeFiltersWithNullValue(filter.filters);
  if (!subFilters.length) {
    return null;
  }

  filter.filters = subFilters;
  return filter;
}

export function convertModelIndexConditionsToRowFilterOptions(logger: Logger, model: RpdDataModel, filters: RpdDataModelIndexOptions[]) {
  if (!filters || !filters.length) {
    return [];
  }

  const replacedFilters: RowFilterOptions[] = [];
  for (const filter of filters) {
    const { operator } = filter;
    if (operator === "and" || operator === "or") {
      replacedFilters.push({
        operator: operator,
        filters: convertModelIndexConditionsToRowFilterOptions(logger, model, filter.filters),
      });
    } else {
      const replacedFilter = replaceModelIndexConditionEntityPropertyWithTableColumn(logger, model, filter);
      if (replacedFilter) {
        replacedFilters.push(replacedFilter);
      }
    }
  }
  return replacedFilters;
}

export function replaceModelIndexConditionEntityPropertyWithTableColumn(
  logger: Logger,
  model: RpdDataModel,
  filter: RpdDataModelIndexOptions,
): RowFilterOptions {
  const { operator } = filter;
  const filterField = (filter as EntityNonRelationPropertyFilterOptions).field;
  let property: RpdDataModelProperty = getEntityOwnPropertyByCode(model, filterField);

  let filterValue = (filter as any).value;

  let columnName = "";
  if (property) {
    if (isOneRelationProperty(property)) {
      columnName = property.targetIdColumnName;
      if (isPlainObject(filterValue)) {
        filterValue = filterValue.id;
      }
    } else if (isManyRelationProperty(property)) {
      logger.warn(`Index condition on many-relation property "${property.code}" is not supported.`);
      return null;
    } else {
      columnName = property.columnName || property.code;
    }
  } else if ((operator as any) === "exists" || (operator as any) === "notExists") {
    logger.warn(`"exists" and "notExists" operators are not supported in index conditions.`);
    return null;
  } else {
    property = getEntityOwnProperty(model, (property) => {
      return property.columnName === filterField;
    });

    if (property) {
      columnName = property.columnName;
    } else {
      // may be relation property.
      property = getEntityOwnProperty(model, (property) => {
        return property.targetIdColumnName === filterField;
      });

      if (property) {
        if (isManyRelationProperty(property)) {
          logger.warn(`Index condition on many-relation property "${property.code}" is not supported.`);
          return null;
        }
        columnName = property.targetIdColumnName;
        if (isPlainObject(filterValue)) {
          filterValue = filterValue.id;
        }
      } else {
        logger.warn(`Unknown field "${filterField}" in index conditions.`);
        return null;
      }
    }
  }

  // TODO: do not use `any` here
  return {
    operator: filter.operator,
    field: columnName,
    value: filterValue,
    itemType: (filter as any).itemType,
  } as RowFilterOptions;
}
