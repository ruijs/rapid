import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "OcUser",
  name: "用户",
  permissionPolicies: {
    find: {
      all: ["user.view"],
    },
  },
  fields: [
    {
      code: "name",
      name: "姓名",
      type: "text",
      required: true,
    },
    {
      code: "login",
      name: "登录账号",
      type: "text",
      required: true,
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
    },
    {
      code: "hidden",
      name: "是否隐藏",
      type: "boolean",
      defaultValue: "false",
      required: true,
    },
    {
      code: "state",
      name: "状态",
      type: "option",
      dataDictionary: "EnabledDisabledState",
      required: true,
    },
    {
      code: "email",
      name: "Email",
      type: "text",
      required: false,
    },
    {
      code: "birthday",
      name: "生日",
      type: "date",
    },
    {
      code: "avatar",
      name: "头像",
      type: "json",
    },
    {
      code: "department",
      name: "部门",
      type: "relation",
      targetSingularCode: "oc_department",
      targetIdColumnName: "department_id",
    },
    {
      code: "roles",
      name: "角色",
      type: "relation[]",
      targetSingularCode: "oc_role",
      linkTableName: "oc_role_user_links",
      targetIdColumnName: "role_id",
      selfIdColumnName: "user_id",
    },
  ],
};

export default entity;
