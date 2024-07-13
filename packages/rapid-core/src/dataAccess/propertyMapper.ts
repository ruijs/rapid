import { RpdDataModel } from "~/types";
import { getEntityPropertyByCode, isOneRelationProperty } from "../helpers/metaHelper";
import { IRpdServer } from "~/core/server";

export function mapPropertyNameToColumnName(server: IRpdServer, model: RpdDataModel, propertyName: string) {
  if (!model.properties) {
    return propertyName;
  }

  const property = getEntityPropertyByCode(server, model, propertyName);
  if (!property) {
    return propertyName;
  }

  if (isOneRelationProperty(property)) {
    return property.targetIdColumnName!;
  }

  return property.columnName || property.code;
}

export function mapPropertyNamesToColumnNames(server: IRpdServer, model: RpdDataModel, propertyNames: string[]) {
  if (!propertyNames || !propertyNames.length) {
    return [];
  }

  return propertyNames.map((fieldName) => mapPropertyNameToColumnName(server, model, fieldName));
}
