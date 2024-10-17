import { cloneDeep, find } from "lodash";
import { RapidEntity, RapidField } from "../types/rapid-entity-types";
import { AppDefinition } from "../rapidAppDefinition";

export function isRelationProperty(property: RapidField) {
  return property.type === "relation" || property.type === "relation[]";
}

export function isOneRelationProperty(property: RapidField) {
  return isRelationProperty(property) && property.relation === "one";
}

export function isManyRelationProperty(property: RapidField) {
  return isRelationProperty(property) && property.relation === "many";
}

export function getEntityProperties(appDef: AppDefinition, model: RapidEntity) {
  return model.fields;
}

export function getEntityPropertiesIncludingBase(appDef: AppDefinition, model: RapidEntity) {
  if (!model.base) {
    return model.fields;
  }

  const baseModel = find(appDef.entities, {
    singularCode: model.base,
  });
  let baseProperties: RapidField[] = [];
  if (baseModel) {
    baseProperties = baseModel.fields.map((property) => {
      property = cloneDeep(property);
      return property;
    });
  }

  return [...baseProperties, ...model.fields];
}

export function getEntityPropertyByCode(appDef: AppDefinition, model: RapidEntity, propertyCode: string): RapidField | undefined {
  return getEntityProperty(appDef, model, (e) => e.code === propertyCode);
}

export function getEntityProperty(appDef: AppDefinition, model: RapidEntity, predicate: (item: RapidField) => boolean): RapidField | undefined {
  let property = model.fields.find(predicate);
  if (!property) {
    const baseModelSingularCode = model.base;
    if (baseModelSingularCode) {
      const baseModel = find(appDef.entities, {
        singularCode: baseModelSingularCode,
      });

      property = baseModel.fields.find(predicate);
      if (property) {
        property = cloneDeep(property);
      }
    }
  }

  return property;
}

export function getEntityOwnPropertyByCode(model: RapidEntity, propertyCode: string): RapidField | undefined {
  return getEntityOwnProperty(model, (e) => e.code === propertyCode);
}

export function getEntityOwnProperty(model: RapidEntity, predicate: (item: RapidField) => boolean): RapidField | undefined {
  let property = model.fields.find(predicate);
  return property;
}

export function getEntityPropertyByFieldName(appDef: AppDefinition, model: RapidEntity, fieldName: string): RapidField | undefined {
  let property = getEntityPropertyByCode(appDef, model, fieldName);
  if (!property) {
    property = getEntityProperty(appDef, model, (item) => item.relation === "one" && item.targetIdColumnName === fieldName);
  }

  if (!property) {
    property = getEntityProperty(appDef, model, (item) => item.columnName === fieldName);
  }

  return property;
}
