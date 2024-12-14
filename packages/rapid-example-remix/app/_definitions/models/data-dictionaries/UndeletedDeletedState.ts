import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "UndeletedDeletedState",
  name: "未删除/已删除状态",
  locales: {
    "en-US": {
      name: "Undeleted/Deleted State",
    },
    "zh-CN": {
      name: "未删除/已删除状态",
    },
    "th-TH": {
      name: "สถานะที่ไม่ถูกลบ/ถูกลบ",
    },
  },
  valueType: "string",
  level: "sys",
  entries: [
    { name: "未删除", value: "undeleted", locales: { "en-US": { name: "Undeleted" }, "zh-CN": { name: "未删除" }, "th-TH": { name: "ไม่ถูกลบ" } } },
    { name: "已删除", value: "deleted", locales: { "en-US": { name: "Deleted" }, "zh-CN": { name: "已删除" }, "th-TH": { name: "ถูกลบ" } } },
  ],
} as RapidDataDictionary;
