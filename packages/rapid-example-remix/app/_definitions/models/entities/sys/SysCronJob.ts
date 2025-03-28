import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "sys",
  code: "SysCronJob",
  name: "定时任务",
  fields: [
    {
      code: "code",
      name: "Code",
      type: "text",
      required: true,
    },
    {
      code: "description",
      name: "描述",
      type: "text",
    },
    {
      code: "cronTime",
      name: "cron表达式",
      type: "text",
    },
    {
      code: "disabled",
      name: "是否禁用",
      type: "boolean",
      required: true,
      defaultValue: "false",
    },
    {
      code: "jobOptions",
      name: "任务选项",
      type: "json",
      required: false,
    },
    {
      code: "isRunning",
      name: "是否正在运行",
      type: "boolean",
      required: true,
      defaultValue: "false",
    },
    {
      code: "nextRunningTime",
      name: "下次运行时间",
      type: "datetime",
    },
    {
      code: "lastRunningTime",
      name: "最后运行时间",
      type: "datetime",
    },
    {
      code: "lastRunningResult",
      name: "最后运行结果",
      type: "option",
      dataDictionary: "SysCronJobRunningResult",
    },
    {
      code: "lastError",
      name: "错误信息",
      type: "text",
    },
    {
      code: "actionHandlerCode",
      name: "操作处理器编码",
      type: "text",
    },
    {
      code: "handler",
      name: "操作处理函数",
      type: "text",
    },
    {
      code: "handleOptions",
      name: "处理选项",
      type: "json",
    },
    {
      code: "onError",
      name: "错误处理函数",
      type: "text",
    },
  ],
};

export default entity;
