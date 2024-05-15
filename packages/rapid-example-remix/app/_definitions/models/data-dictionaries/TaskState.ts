import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: 'TaskState',
  name: '任务状态',
  valueType: 'string',
  level: "app",
  entries: [
    { name: '待处理', value: 'pending' },
    { name: '处理中', value: 'processing' },
    { name: '已完成', value: 'done' },
    { name: '已关闭', value: 'closed' },
    { name: '重开', value: 'reopened' },
  ],
} as RapidDataDictionary;
