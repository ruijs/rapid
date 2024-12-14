import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "PublishState",
  name: "发布状态",
  locales: {
    "en-US": {
      name: "Publish State",
    },
    "zh-CN": {
      name: "发布状态",
    },
    "th-TH": {
      name: "สถานะที่เผยแพร่",
    },
  },
  valueType: "string",
  level: "app",
  entries: [
    { name: "草稿", value: "draft", locales: { "en-US": { name: "Draft" }, "zh-CN": { name: "草稿" }, "th-TH": { name: "ร่าง" } } },
    { name: "审核中", value: "in_review", color: "orange", locales: { "en-US": { name: "In Review" }, "zh-CN": { name: "审核中" }, "th-TH": { name: "กำลังตรวจสอบ" } } },
    { name: "已发布", value: "published", color: "green", locales: { "en-US": { name: "Published" }, "zh-CN": { name: "已发布" }, "th-TH": { name: "เผยแพร่" } } },
    { name: "已归档", value: "archived", color: "red", locales: { "en-US": { name: "Archived" }, "zh-CN": { name: "已归档" }, "th-TH": { name: "กลับดู" } } },
    { name: "已撤回", value: "withdrawed", color: "red", locales: { "en-US": { name: "Withdrawed" }, "zh-CN": { name: "已撤回" }, "th-TH": { name: "ยกเลิก" } } },
  ],
} as RapidDataDictionary;
