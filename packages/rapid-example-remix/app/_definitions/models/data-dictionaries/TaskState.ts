import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "TaskState",
  name: "任务状态",
  locales: {
    "en-US": {
      name: "Task State",
    },
    "zh-CN": {
      name: "任务状态",
    },
    "th-TH": {
      name: "สถานะงาน",
    },
  },
  valueType: "string",
  level: "app",
  entries: [
    { name: "待处理", value: "pending", locales: { "en-US": { name: "Pending" }, "zh-CN": { name: "待处理" }, "th-TH": { name: "กำลังดำเนินการ" } } },
    { name: "处理中", value: "processing", locales: { "en-US": { name: "Processing" }, "zh-CN": { name: "处理中" }, "th-TH": { name: "กำลังดำเนินการ" } } },
    { name: "已完成", value: "done", locales: { "en-US": { name: "Done" }, "zh-CN": { name: "已完成" }, "th-TH": { name: "เสร็จสิ้น" } } },
    { name: "已关闭", value: "closed", locales: { "en-US": { name: "Closed" }, "zh-CN": { name: "已关闭" }, "th-TH": { name: "ปิด" } } },
    { name: "重开", value: "reopened", locales: { "en-US": { name: "Reopened" }, "zh-CN": { name: "重开" }, "th-TH": { name: "เปิดใหม่" } } },
  ],
} as RapidDataDictionary;
