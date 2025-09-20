import { Framework } from "@ruiapp/move-style";
import { getMetaDictionaryEntryLocaleName } from "../helpers/i18nHelper";
import rapidAppDefinition from "../rapidAppDefinition";

export function getDataDictionaryEntries(framework: Framework, dataDictionaryCode: string) {
  if (!dataDictionaryCode) {
    return [];
  }

  let dataDictionary = rapidAppDefinition.getDataDictionaryByCode(dataDictionaryCode);

  const dictionaryEntries = dataDictionary.entries.map((entry) => {
    return {
      ...entry,
      name: getMetaDictionaryEntryLocaleName(framework, dataDictionary, entry),
    };
  });

  return dictionaryEntries;
}
