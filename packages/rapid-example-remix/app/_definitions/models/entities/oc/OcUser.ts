import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "OcUser",
  name: "用户",
  i18n: {
    name: "common.user",
  },
  permissionPolicies: {
    find: {
      all: ["user.view"],
    },
  },
  softDelete: true,
  fields: [
    {
      code: "name",
      name: "姓名",
      type: "text",
      required: true,
      i18n: {
        name: "common.name",
      },
    },
    {
      code: "login",
      name: "登录账号",
      type: "text",
      required: true,
      i18n: {
        name: "common.loginAccount",
      },
    },
    {
      code: "password",
      name: "密码",
      type: "text",
      config: {
        dataManage: {
          hidden: true,
        },
      },
      i18n: {
        name: "common.password",
      },
    },
    {
      code: "hidden",
      name: "是否隐藏",
      type: "boolean",
      defaultValue: "false",
      required: true,
      locales: {
        "zh-CN": {
          name: "是否隐藏",
        },
        "en-US": {
          name: "Hidden",
        },
        "th-TH": {
          name: "ซ่อน",
        },
      },
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
      required: true,
      i18n: {
        name: "common.state",
      },
    },
    {
      code: "email",
      name: "Email",
      type: "text",
      required: false,
      i18n: {
        name: "common.email",
      },
    },
    {
      code: "birthday",
      name: "生日",
      type: "date",
      locales: {
        "zh-CN": {
          name: "生日",
        },
        "en-US": {
          name: "Birthday",
        },
        "th-TH": {
          name: "วันเกิด",
        },
      },
    },
    {
      code: "avatar",
      name: "头像",
      type: "image",
      locales: {
        "zh-CN": {
          name: "头像",
        },
        "en-US": {
          name: "Avatar",
        },
        "th-TH": {
          name: "รูปภาพ",
        },
      },
    },
    {
      code: "department",
      name: "部门",
      type: "relation",
      targetSingularCode: "oc_department",
      targetIdColumnName: "department_id",
      locales: {
        "zh-CN": {
          name: "部门",
        },
        "en-US": {
          name: "Department",
        },
        "th-TH": {
          name: "แผนก",
        },
      },
    },
    {
      code: "roles",
      name: "角色",
      type: "relation[]",
      targetSingularCode: "oc_role",
      linkTableName: "oc_role_user_links",
      targetIdColumnName: "role_id",
      selfIdColumnName: "user_id",
      locales: {
        "zh-CN": {
          name: "角色",
        },
        "en-US": {
          name: "Roles",
        },
        "th-TH": {
          name: "บทบาท",
        },
      },
    },
  ],
  indexes: [
    {
      unique: true,
      properties: ["login"],
      conditions: [
        {
          operator: "eq",
          field: "state",
          value: "enabled",
        },
        {
          operator: "null",
          field: "deleted_at",
        },
      ],
    },
  ],
};

export default entity;
