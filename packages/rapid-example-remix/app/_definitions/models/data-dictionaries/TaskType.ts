import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "TaskType",
  name: "任务类型",
  locales: {
    "en-US": {
      name: "Task Type",
    },
    "zh-CN": {
      name: "任务类型",
    },
    "th-TH": {
      name: "ประเภทงาน",
    },
  },
  valueType: "string",
  level: "app",
  entries: [
    { name: "文档", value: "documenting", locales: { "en-US": { name: "Documenting" }, "zh-CN": { name: "文档" }, "th-TH": { name: "บันทึก" } } },
    { name: "开发", value: "development", locales: { "en-US": { name: "Development" }, "zh-CN": { name: "开发" }, "th-TH": { name: "พัฒนา" } } },
    { name: "修复问题", value: "bug", locales: { "en-US": { name: "Bug" }, "zh-CN": { name: "修复问题" }, "th-TH": { name: "แก้ไขปัญหา" } } },
    { name: "部署", value: "deployment", locales: { "en-US": { name: "Deployment" }, "zh-CN": { name: "部署" }, "th-TH": { name: "การจัดการ" } } },
    { name: "培训", value: "training", locales: { "en-US": { name: "Training" }, "zh-CN": { name: "培训" }, "th-TH": { name: "การฝึกอบรม" } } },
    { name: "会议", value: "meeting", locales: { "en-US": { name: "Meeting" }, "zh-CN": { name: "会议" }, "th-TH": { name: "การประชุม" } } },
  ],
} as RapidDataDictionary;
