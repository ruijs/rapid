import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "CronJobRunningResult",
  name: "定时任务运行结果",
  valueType: "string",
  level: "sys",
  entries: [
    { name: "成功", value: "success" },
    { name: "失败", value: "failed" },
    { name: "出错", value: "error" },
  ],
} as RapidDataDictionary;
