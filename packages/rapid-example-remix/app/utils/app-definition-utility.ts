import type { RapidServer, RpdDataDictionary, RpdDataModel } from "@ruiapp/rapid-core";
import { RapidDataDictionary, RapidEntity } from "@ruiapp/rapid-extension";
import type { AppDefinition } from "@ruiapp/rapid-extension/src/rapidAppDefinition";
import { camelCase, capitalize } from "lodash";

export function getRapidAppDefinitionFromRapidServer(rapidServer: RapidServer): AppDefinition {
  const entities: RapidEntity[] = [];
  const dataDictionaries: RapidDataDictionary[] = [];

  const rpdAppConfig = rapidServer.getApplicationConfig();

  for (const dataModel of rpdAppConfig.models) {
    entities.push(convertDataModelCfgToEntityDef(dataModel));
  }

  for (const dataDictionary of rpdAppConfig.dataDictionaries) {
    dataDictionaries.push(convertDataDictionaryCfgToDictionaryDef(dataDictionary));
  }

  return {
    entities,
    dataDictionaries,
  };
}

export function convertDataModelCfgToEntityDef(source: RpdDataModel) {
  const entityDef: RapidEntity = {
    namespace: source.namespace,
    code: source.code || "",
    name: source.name,
    // TODO: add data model description
    description: "",
    singularCode: source.singularCode,
    pluralCode: source.pluralCode,
    dbSchema: source.schema,
    tableName: source.tableName,
    base: source.base,
    derivedType: source.derivedType,
    derivedTypePropertyCode: source.derivedTypePropertyCode,
    fields: source.properties,
    indexes: source.indexes,
    permissionPolicies: source.permissionPolicies,
  };

  return entityDef;
}

export function convertDataDictionaryCfgToDictionaryDef(source: RpdDataDictionary) {
  const dictionaryDef: RapidDataDictionary = {
    code: source.code,
    name: source.name,
    description: source.description,
    valueType: source.valueType,
    level: source.level,
    entries: source.entries,
  };

  return dictionaryDef;
}
