import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "BugLevel",
  name: "Bug等级",
  locales: {
    "en-US": {
      name: "Bug Level",
    },
    "zh-CN": {
      name: "Bug等级",
    },
    "th-TH": {
      name: "ระดับของข้อบกพร่อง",
    },
  },
  valueType: "string",
  level: "app",
  entries: [
    { name: "Critical", value: "critical", locales: { "en-US": { name: "Critical" }, "zh-CN": { name: "严重" }, "th-TH": { name: "ระดับสำคัญ" } } },
    { name: "Error", value: "error", locales: { "en-US": { name: "Error" }, "zh-CN": { name: "错误" }, "th-TH": { name: "ข้อผิดพลาด" } } },
    { name: "Suggest", value: "suggest", locales: { "en-US": { name: "Suggest" }, "zh-CN": { name: "建议" }, "th-TH": { name: "แนะนำ" } } },
  ],
} as RapidDataDictionary;
