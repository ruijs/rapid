import { RpdDataModel } from "~/types";
import { isRelationProperty } from "~/utilities/rapidUtility";

export function mapPropertyNameToColumnName(model: RpdDataModel, propertyName: string) {
  if (!model.properties) {
    return propertyName;
  }

  const property = model.properties.find(item => item.code === propertyName);
  if (!property) {
    return propertyName;
  }

  if (isRelationProperty(property) && property.relation === "one") {
    return property.targetIdColumnName!;
  }

  return property.columnName || property.code;
}

export function mapPropertyNamesToColumnNames(model: RpdDataModel, propertyNames: string[]) {
  if (!propertyNames || !propertyNames.length) {
    return [];
  }

  return propertyNames.map(fieldName => mapPropertyNameToColumnName(model, fieldName));
}