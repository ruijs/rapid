import { find } from "lodash";
import type { RapidDataDictionary, RapidEntity } from "./types/rapid-entity-types";

export interface AppDefinition {
  entities: RapidEntity[];
  dataDictionaries: RapidDataDictionary[];
}

let appDef: AppDefinition;

let apiBaseUrl: string;

export default {
  setAppDefinition(def: AppDefinition) {
    appDef = def;
  },

  setApiBaseUrl(baseUrl: string) {
    apiBaseUrl = baseUrl;
  },

  getApiBaseUrl() {
    return apiBaseUrl || "/api";
  },

  getAppDefinition() {
    return appDef;
  },

  getEntities() {
    return appDef.entities;
  },

  getDataDictionaries() {
    return appDef.dataDictionaries;
  },

  getDataDictionaryByCode(dataDictionaryCode: string) {
    return find(appDef.dataDictionaries, (item) => item.code === dataDictionaryCode);
  },

  getEntityByCode(entityCode: string) {
    return find(appDef.entities, (item) => item.code === entityCode);
  },

  getEntityBySingularCode(singularCode: string) {
    return find(appDef.entities, (item) => item.singularCode === singularCode);
  },

  getEntityFieldByCode(entity: RapidEntity, fieldCode: string) {
    const isDerived = !!entity.base;
    let field = find(entity.fields, { code: fieldCode });
    if (!field && isDerived) {
      const baseEntity = find(appDef.entities, (item) => item.singularCode === entity.base);
      field = find(baseEntity.fields, { code: fieldCode });
    }

    return field;
  },
};
