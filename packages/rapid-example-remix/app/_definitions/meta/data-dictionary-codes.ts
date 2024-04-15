const dictionaryCodes = [
  'EnabledDisabledState',
  'PublishState',
  'UndeletedDeletedState',
] as const;
export type TDictionaryCodes = typeof dictionaryCodes[number];
