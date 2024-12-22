import { Framework } from "@ruiapp/move-style";
import { RapidDataDictionary, RapidDataDictionaryEntry, RapidEntity, RapidField } from "../types/rapid-entity-types";

export function hasMetaLocaleStringResource(framework: Framework, stringResourceName: string) {
  return framework.hasLocaleStringResource("meta", stringResourceName);
}

export function getMetaLocaleStringResource(framework: Framework, stringResourceName: string, params?: Record<string, any>) {
  return framework.getLocaleStringResource("meta", stringResourceName, params);
}

export function getMetaEntityLocaleName(framework: Framework, entity: RapidEntity) {
  return getMetaEntityLocaleStringResource(framework, entity, "name");
}

export function getMetaEntityLocaleDescription(framework: Framework, entity: RapidEntity) {
  return getMetaEntityLocaleStringResource(framework, entity, "description");
}

export function getMetaEntityLocaleStringResource(framework: Framework, entity: RapidEntity, attributeName: string) {
  if (!entity) {
    return null;
  }
  const localeStringResourceName = entity.i18n?.[attributeName] || `entities.${entity.code}.${attributeName}`;
  if (hasMetaLocaleStringResource(framework, localeStringResourceName)) {
    return getMetaLocaleStringResource(framework, localeStringResourceName);
  }
  return entity[attributeName];
}

export function getMetaPropertyLocaleName(framework: Framework, entity: RapidEntity, property: RapidField) {
  return getMetaPropertyLocaleStringResource(framework, entity, property, "name");
}

export function getMetaPropertyLocaleDescription(framework: Framework, entity: RapidEntity, property: RapidField) {
  return getMetaPropertyLocaleStringResource(framework, entity, property, "description");
}

export function getMetaPropertyLocaleStringResource(framework: Framework, entity: RapidEntity, property: RapidField, attributeName: string) {
  if (!property) {
    return null;
  }
  const localeStringResourceName = property.i18n?.[attributeName] || `entities.${entity.code}.fields.${property.code}.${attributeName}`;
  if (hasMetaLocaleStringResource(framework, localeStringResourceName)) {
    return getMetaLocaleStringResource(framework, localeStringResourceName);
  }
  return property[attributeName];
}

export function getMetaDictionaryLocaleName(framework: Framework, dictionary: RapidDataDictionary) {
  return getMetaDictionaryLocaleStringResource(framework, dictionary, "name");
}

export function getMetaDictionaryLocaleDescription(framework: Framework, dictionary: RapidDataDictionary) {
  return getMetaDictionaryLocaleStringResource(framework, dictionary, "description");
}

export function getMetaDictionaryLocaleStringResource(framework: Framework, dictionary: RapidDataDictionary, attributeName: string) {
  const localeStringResourceName = dictionary.i18n?.[attributeName] || `dictionaries.${dictionary.code}.${attributeName}`;
  if (hasMetaLocaleStringResource(framework, localeStringResourceName)) {
    return getMetaLocaleStringResource(framework, localeStringResourceName);
  }
  return dictionary[attributeName];
}

export function getMetaDictionaryEntryLocaleName(framework: Framework, dictionary: RapidDataDictionary, entry: RapidDataDictionaryEntry) {
  return getMetaDictionaryEntryLocaleStringResource(framework, dictionary, entry, "name");
}

export function getMetaDictionaryEntryLocaleDescription(framework: Framework, dictionary: RapidDataDictionary, entry: RapidDataDictionaryEntry) {
  return getMetaDictionaryEntryLocaleStringResource(framework, dictionary, entry, "description");
}

export function getMetaDictionaryEntryLocaleStringResource(
  framework: Framework,
  dictionary: RapidDataDictionary,
  entry: RapidDataDictionaryEntry,
  attributeName: string,
) {
  const localeStringResourceName = entry.i18n?.[attributeName] || `dictionaries.${dictionary.code}.entries.${entry.value}.${attributeName}`;
  if (hasMetaLocaleStringResource(framework, localeStringResourceName)) {
    return getMetaLocaleStringResource(framework, localeStringResourceName);
  }
  return entry[attributeName];
}

export function hasExtensionLocaleStringResource(framework: Framework, stringResourceName: string) {
  return framework.hasLocaleStringResource("rapid-extension", stringResourceName);
}

export function getExtensionLocaleStringResource(framework: Framework, stringResourceName: string, params?: Record<string, any>) {
  return framework.getLocaleStringResource("rapid-extension", stringResourceName, params);
}
