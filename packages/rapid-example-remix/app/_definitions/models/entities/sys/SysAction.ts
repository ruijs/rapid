import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  metaOnly: true,
  namespace: "sys",
  code: "SysAction",
  name: "系统操作",
  tableName: "sys_actions",
  fields: [
    {
      code: "group",
      name: "分组",
      type: "relation",
      targetSingularCode: "sys_action_group",
      targetIdColumnName: "group_id",
      required: true,
    },
    {
      code: "code",
      name: "Code",
      type: "text",
      required: true,
    },
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
      required: true,
      defaultValue: "0",
    },
  ],
};

export default entity;
