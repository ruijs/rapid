const dictionaryCodes = [
  'BugLevel',
  'EnabledDisabledState',
  'PublishState',
  'TaskState',
  'UndeletedDeletedState',
] as const;
export type TDictionaryCodes = typeof dictionaryCodes[number];
