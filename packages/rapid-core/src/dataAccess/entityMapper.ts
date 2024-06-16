import type { IRpdServer } from "~/core/server";
import { RpdDataModel } from "~/types";
import { isRelationProperty } from "~/utilities/rapidUtility";
import { getEntityProperty, getEntityPropertyByCode } from "./metaHelper";

// TODO Generate mapper and cache it.

export function mapDbRowToEntity(server: IRpdServer, model: RpdDataModel, row: any, keepNonPropertyFields: boolean) {
  if (!row) {
    return null;
  }

  if (!model.properties || !model.properties.length) {
    return row;
  }

  const result: Record<string, any> = {};
  const columnNames = Object.keys(row);
  // TODO: Improve performance.
  columnNames.forEach((columnName) => {
    let isRelationProp = false;
    let propertyName = columnName;
    let property = getEntityProperty(server, model, (item) => item.columnName === columnName);
    if (property) {
      propertyName = property.code;
    } else {
      property = getEntityProperty(server, model, (item) => item.relation === "one" && item.targetIdColumnName === columnName);
      if (property) {
        isRelationProp = true;
        propertyName = property.code;
      } else if (keepNonPropertyFields) {
        propertyName = columnName;
      }
    }

    if (property?.config?.dataManage?.hidden) {
      return;
    }

    if (isRelationProp) {
      if (row[propertyName]) {
        if (!result[propertyName]) {
          result[propertyName] = row[propertyName];
        }
      } else if (keepNonPropertyFields) {
        result[columnName] = row[columnName];
      }
    } else {
      if (!result[propertyName]) {
        result[propertyName] = row[columnName];
      }
    }
  });

  return result;
}

export type DbRowWithBaseRow = {
  row?: Record<string, any>;
  baseRow?: Record<string, any>;
}

export function mapEntityToDbRow(server: IRpdServer, model: RpdDataModel, entity: any): DbRowWithBaseRow {
  let result: DbRowWithBaseRow = {};
  if (!entity) {
    return result;
  }

  const row = result.row = {};
  const baseRow = result.baseRow = {};
  if (!model.properties || !model.properties.length) {
    return result;
  }

  const propertyNames = Object.keys(entity);
  propertyNames.forEach((propertyName) => {
    let columnName = propertyName;
    const property = getEntityPropertyByCode(server, model, propertyName);
    if (property) {
      if (!isRelationProperty(property)) {
        columnName = property.columnName || property.code;
        if (property.isBaseProperty) {
          baseRow[columnName] = entity[propertyName];
        } else {
          row[columnName] = entity[propertyName];
        }
      }
    } else {
      const oneRelationProperty = getEntityProperty(server, model, (item) => item.relation === "one" && item.targetIdColumnName === propertyName);
      if (oneRelationProperty) {
        if (oneRelationProperty.isBaseProperty) {
          baseRow[columnName] = entity[propertyName];
        } else {
          row[columnName] = entity[propertyName];
        }
      }
    }
  });

  return result;
}
