import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "TaskType",
  name: "任务类型",
  valueType: "string",
  level: "app",
  entries: [
    { name: "文档", value: "documenting" },
    { name: "开发", value: "development" },
    { name: "修复问题", value: "bug" },
    { name: "部署", value: "deployment" },
    { name: "培训", value: "training" },
    { name: "会议", value: "meeting" },
  ],
} as RapidDataDictionary;
