const dictionaryCodes = [
  'BugLevel',
  'SysCronJobRunningResult',
  'EnabledDisabledState',
  'PmProjectState',
  'PublishState',
  'TaskState',
  'TaskType',
  'UndeletedDeletedState',
] as const;
export type TDictionaryCodes = typeof dictionaryCodes[number];
