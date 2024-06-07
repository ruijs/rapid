import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: 'BugLevel',
  name: 'Bug等级',
  valueType: 'string',
  level: "app",
  entries: [
    { name: 'Critical', value: 'critical' },
    { name: 'Error', value: 'error' },
    { name: 'Suggest', value: 'suggest' },
  ],
} as RapidDataDictionary;
