const dictionaryCodes = [
  'BugLevel',
  'EnabledDisabledState',
  'PmProjectState',
  'PublishState',
  'TaskState',
  'TaskType',
  'UndeletedDeletedState',
] as const;
export type TDictionaryCodes = typeof dictionaryCodes[number];
