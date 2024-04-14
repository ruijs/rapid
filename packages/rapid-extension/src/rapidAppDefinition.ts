import type { RapidDataDictionary, RapidEntity } from "./types/rapid-entity-types";

export interface AppDefinition {
  entities: RapidEntity[],
  dataDictionaries: RapidDataDictionary[],
}
let appDef: AppDefinition;

export default {
  setAppDefinition(def: AppDefinition) {
    appDef = def;
  },

  getEntities() {
    return appDef.entities;
  },

  getDataDictionaries() {
    return appDef.dataDictionaries;
  }
}