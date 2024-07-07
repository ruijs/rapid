import { cloneDeep } from "lodash";
import { IRpdServer } from "~/core/server";
import { RpdDataModel, RpdDataModelProperty } from "~/types";

export function isRelationProperty(property: RpdDataModelProperty) {
  return property.type === "relation" || property.type === "relation[]";
}

export function isOneRelationProperty(property: RpdDataModelProperty) {
  return isRelationProperty(property) && property.relation === "one";
}

export function isManyRelationProperty(property: RpdDataModelProperty) {
  return isRelationProperty(property) && property.relation === "many";
}

export function getEntityProperties(server: IRpdServer, model: RpdDataModel) {
  return model.properties;
}

export function getEntityPropertiesIncludingBase(server: IRpdServer, model: RpdDataModel) {
  if (!model.base) {
    return model.properties;
  }

  const baseModel = server.getModel({
    singularCode: model.base,
  });
  let baseProperties: RpdDataModelProperty[] = [];
  if (baseModel) {
    baseProperties = baseModel.properties.map((property) => {
      property = cloneDeep(property);
      property.isBaseProperty = true;
      return property;
    });
  }

  return [...baseProperties, ...model.properties];
}

export function getEntityPropertyByCode(server: IRpdServer, model: RpdDataModel, propertyCode: string) {
  return getEntityProperty(server, model, (e) => e.code === propertyCode);
}

export function getEntityProperty(server: IRpdServer, model: RpdDataModel, predicate: (item: RpdDataModelProperty) => boolean) {
  let property = model.properties.find(predicate);
  if (!property) {
    const baseModelSingularCode = model.base;
    if (baseModelSingularCode) {
      const baseModel = server.getModel({
        singularCode: baseModelSingularCode,
      });

      property = baseModel.properties.find(predicate);
      if (property) {
        property = cloneDeep(property);
        property.isBaseProperty = true;
      }
    }
  }

  return property;
}
