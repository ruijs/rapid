import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "EnabledDisabledState",
  name: "启用/禁用状态",
  locales: {
    "en-US": {
      name: "Enabled/Disabled State",
    },
    "zh-CN": {
      name: "启用/禁用状态",
    },
    "th-TH": {
      name: "สถานะที่เปิดใช้งาน/ปิดใช้งาน",
    },
  },
  valueType: "string",
  level: "sys",
  entries: [
    { name: "启用", value: "enabled", color: "green", locales: { "en-US": { name: "Enabled" }, "zh-CN": { name: "启用" }, "th-TH": { name: "เปิดใช้งาน" } } },
    { name: "禁用", value: "disabled", color: "red", locales: { "en-US": { name: "Disabled" }, "zh-CN": { name: "禁用" }, "th-TH": { name: "ปิดใช้งาน" } } },
  ],
} as RapidDataDictionary;
