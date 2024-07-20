import { PropertySequenceConfig } from "@ruiapp/rapid-core";
import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "PmProject",
  name: "项目",
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
    },
    {
      code: "description",
      name: "描述",
      type: "text",
    },
    {
      code: "orderNum",
      name: "排序号",
      type: "integer",
    },
    {
      code: "state",
      name: "项目状态",
      type: "option",
      dataDictionary: "PmProjectState",
    },
    {
      code: "allowedTaskTypes",
      name: "任务类型",
      type: "option[]",
      dataDictionary: "TaskType",
    },
    {
      code: "tasks",
      name: "任务",
      type: "relation[]",
      targetSingularCode: "pm_task",
      selfIdColumnName: "project_id",
    },
  ],
};

export default entity;
