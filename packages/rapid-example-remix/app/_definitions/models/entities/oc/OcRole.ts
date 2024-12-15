import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "OcRole",
  name: "角色",
  i18n: {
    name: "common.role",
  },
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
      i18n: {
        name: "common.name",
      },
    },
    {
      code: "description",
      name: "描述",
      type: "text",
      i18n: {
        name: "common.description",
      },
    },
    {
      code: "orderNum",
      name: "排序",
      type: "integer",
      required: true,
      i18n: {
        name: "common.orderNum",
      },
    },
    {
      code: "state",
      name: "状态",
      required: true,
      type: "option",
      dataDictionary: "EnabledDisabledState",
      i18n: {
        name: "common.state",
      },
    },
    {
      code: "users",
      name: "用户",
      type: "relation[]",
      targetSingularCode: "oc_user",
      linkTableName: "oc_role_user_links",
      targetIdColumnName: "user_id",
      selfIdColumnName: "role_id",
      entityDeletingReaction: "unlink",
      i18n: {
        name: "common.users",
      },
    },
    {
      code: "actions",
      name: "操作",
      type: "relation[]",
      targetSingularCode: "sys_action",
      linkTableName: "oc_role_sys_action_links",
      targetIdColumnName: "action_id",
      selfIdColumnName: "role_id",
      locales: {
        "en-US": {
          name: "Actions",
        },
        "zh-CN": {
          name: "操作",
        },
        "th-TH": {
          name: "การดำเนินการ",
        },
      },
    },
  ],
  indexes: [
    {
      properties: ["name"],
      conditions: [
        {
          field: "deletedAt",
          operator: "notNull",
        },
      ],
    },
  ],
};

export default entity;
