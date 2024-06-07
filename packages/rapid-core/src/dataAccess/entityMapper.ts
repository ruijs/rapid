import { RpdDataModel } from "~/types";
import { isRelationProperty } from "~/utilities/rapidUtility";

// TODO Generate mapper and cache it.

export function mapDbRowToEntity(model: RpdDataModel, row: any, keepNonPropertyFields: boolean) {
  if (!row) {
    return null;
  }

  if (!model.properties || !model.properties.length) {
    return row;
  }

  const result: Record<string, any> = {};
  const columnNames = Object.keys(row);
  columnNames.forEach((columnName) => {
    let isRelationProp = false;
    let propertyName = columnName;
    let property = model.properties.find((item) => item.columnName === columnName);
    if (property) {
      propertyName = property.code;
    } else {
      property = model.properties.find((item) => item.relation === "one" && item.targetIdColumnName === columnName);
      if (property) {
        isRelationProp = true;
        propertyName = property.code;
      } else if (keepNonPropertyFields) {
        propertyName = columnName;
      }
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

export function mapEntityToDbRow(model: RpdDataModel, entity: any) {
  if (!entity) {
    return null;
  }

  if (!model.properties || !model.properties.length) {
    return entity;
  }

  const result: Record<string, any> = {};
  const propertyNames = Object.keys(entity);
  propertyNames.forEach((propertyName) => {
    let columnName = propertyName;
    const property = model.properties.find((item) => item.code === propertyName);
    if (property) {
      if (!isRelationProperty(property)) {
        columnName = property.columnName || property.code;
        result[columnName] = entity[propertyName];
      }
    } else {
      const oneRelationProperty = model.properties.find((item) => item.relation === "one" && item.targetIdColumnName === propertyName);
      if (oneRelationProperty) {
        result[propertyName] = entity[propertyName];
      }
    }
  });

  return result;
}
