import type { FunctionMeta } from "@ruiapp/move-style";
import { forEach, isArray, isEmpty, isNull, isString, isUndefined, map } from "lodash";
import { SearchFormFilterConfiguration } from "../types/rapid-entity-types";
import moment from "moment";
import { FilterFieldConfig } from "../mod";

export const searchParamsToFilters = (filterConfigurations: SearchFormFilterConfiguration[], searchParams: Record<string, any>) => {
  const filters: any[] = [];

  for (const filterConfig of filterConfigurations) {
    const paramValue = searchParams[filterConfig.code];
    if (isNull(paramValue) || isUndefined(paramValue) || (isArray(paramValue) && isEmpty(paramValue))) {
      continue;
    }

    if (isArray(filterConfig.filters) && !isEmpty(filterConfig.filters)) {
      filters.push(...parseConfigToFilters(filterConfig.filters, paramValue));
    } else {
      const filterMode = filterConfig.filterMode || "eq";
      let filterFields = filterConfig.filterFields || [filterConfig.code];
      if (!filterFields.length) {
        filterFields = [filterConfig.code];
      }

      const filterConfigs = map(filterFields, (f) =>
        isString(f) ? { field: f, operator: filterMode, itemType: filterConfig.itemType, extra: filterConfig.filterExtra } : f,
      );
      filters.push(...parseConfigToFilters(filterConfigs, paramValue));
    }
  }

  return filters;
};

export default {
  name: "searchParamsToFilters",
  func: searchParamsToFilters,
} as FunctionMeta;

export function parseConfigToFilters(filterConfigs: FilterFieldConfig[], value: any) {
  let filters: any[] = [];

  forEach(filterConfigs, (c) => {
    if (c.filters && !isEmpty(c.filters)) {
      filters.push({
        field: c.field,
        operator: c.operator,
        filters: parseConfigToFilters(c.filters, value),
      });
      return;
    }

    if (c.operator === "range") {
      const { rangeUnit } = c.extra || {};

      if (!isArray(value)) {
        return;
      }

      filters.push({
        field: c.field,
        operator: "gte",
        value: value[0] && rangeUnit ? moment(value[0]).startOf(rangeUnit) : value[0],
        itemType: c.itemType,
      });
      filters.push({
        field: c.field,
        operator: "lt",
        value: value[1] && rangeUnit ? moment(value[1]).add(1, rangeUnit).startOf(rangeUnit) : value[1],
        itemType: c.itemType,
      });
      return;
    }

    filters.push({
      field: c.field,
      operator: c.operator,
      itemType: c.itemType,
      value,
    });
  });

  return filters;
}
