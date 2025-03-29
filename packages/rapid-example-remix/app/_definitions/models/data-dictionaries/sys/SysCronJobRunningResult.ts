import type { RapidDataDictionary } from "@ruiapp/rapid-extension";

export default {
  code: "SysCronJobRunningResult",
  name: "定时任务运行结果",
  valueType: "string",
  level: "sys",
  entries: [
    { name: "成功", value: "success", color: "green" },
    { name: "失败", value: "failed", color: "red" },
    { name: "出错", value: "error", color: "orange" },
  ],
} as RapidDataDictionary;
