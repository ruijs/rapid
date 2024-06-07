import { IRpdServer } from "~/core/server";
import { RpdDataModel, RpdDataModelProperty } from "~/types";

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
  baseModel.properties.forEach(prop => prop.isBaseProperty = true);

  return [
    ...baseModel.properties,
    ...model.properties,
  ]
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
        property.isBaseProperty = true;
      }
    }
  }

  return property;
}