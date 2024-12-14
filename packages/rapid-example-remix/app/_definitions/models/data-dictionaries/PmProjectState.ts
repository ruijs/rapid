import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "PmProjectState",
  name: "项目状态",
  locales: {
    "en-US": {
      name: "Project State",
    },
    "zh-CN": {
      name: "项目状态",
    },
    "th-TH": {
      name: "สถานะโครงการ",
    },
  },
  valueType: "string",
  level: "app",
  entries: [
    { name: "活跃", value: "active", color: "green", locales: { "en-US": { name: "Active" }, "zh-CN": { name: "活跃" }, "th-TH": { name: "กำลังดำเนินการ" } } },
    { name: "暂停", value: "suspended", color: "orange", locales: { "en-US": { name: "Suspended" }, "zh-CN": { name: "暂停" }, "th-TH": { name: "หยุดการดำเนินการ" } } },
    { name: "关闭", value: "closed", color: "red", locales: { "en-US": { name: "Closed" }, "zh-CN": { name: "关闭" }, "th-TH": { name: "ปิด" } } },
  ],
} as RapidDataDictionary;
