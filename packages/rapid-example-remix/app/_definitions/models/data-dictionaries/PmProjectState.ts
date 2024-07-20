import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "PmProjectState",
  name: "项目状态",
  valueType: "string",
  level: "app",
  entries: [
    { name: "活跃", value: "active", color: "green" },
    { name: "暂停", value: "suspended", color: "orange" },
    { name: "关闭", value: "closed", color: "red" },
  ],
} as RapidDataDictionary;
