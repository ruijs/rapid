import type { RapidDataDictionary } from '@ruiapp/rapid-extension';

export default {
  code: 'UndeletedDeletedState',
  name: '未删除/已删除状态',
  valueType: 'string',
  level: 'sys',
  entries: [
    { name: '未删除', value: 'undeleted' },
    { name: '已删除', value: 'deleted' },
  ],
} as RapidDataDictionary;
