import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "OcRole",
  name: "角色",
  locales: {
    "en-US": {
      name: "Role",
    },
    "zh-CN": {
      name: "角色",
    },
    "th-TH": {
      name: "บทบาท",
    },
  },
  fields: [
    {
      code: "name",
      name: "名称",
      type: "text",
      required: true,
      locales: {
        "en-US": {
          name: "Name",
        },
        "zh-CN": {
          name: "名称",
        },
        "th-TH": {
          name: "ชื่อ",
        },
      },
    },
    {
      code: "description",
      name: "描述",
      type: "text",
      locales: {
        "en-US": {
          name: "Description",
        },
        "zh-CN": {
          name: "描述",
        },
        "th-TH": {
          name: "คำอธิบาย",
        },
      },
    },
    {
      code: "orderNum",
      name: "排序",
      type: "integer",
      required: true,
      locales: {
        "en-US": {
          name: "Order",
        },
        "zh-CN": {
          name: "排序",
        },
        "th-TH": {
          name: "ลำดับ",
        },
      },
    },
    {
      code: "state",
      name: "状态",
      required: true,
      type: "option",
      dataDictionary: "EnabledDisabledState",
      locales: {
        "en-US": {
          name: "State",
        },
        "zh-CN": {
          name: "状态",
        },
        "th-TH": {
          name: "สถานะ",
        },
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
      locales: {
        "en-US": {
          name: "Users",
        },
        "zh-CN": {
          name: "用户",
        },
        "th-TH": {
          name: "ผู้ใช้งาน",
        },
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
