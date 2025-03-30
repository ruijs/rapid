const dictionaryCodes = [
  'BugLevel',
  'EnabledDisabledState',
  'PmProjectState',
  'PublishState',
  'TaskState',
  'TaskType',
  'UndeletedDeletedState',
  'SysCronJobRunningResult',
] as const;
export type TDictionaryCodes = typeof dictionaryCodes[number];
