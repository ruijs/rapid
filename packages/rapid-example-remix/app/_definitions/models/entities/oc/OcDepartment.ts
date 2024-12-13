import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "OcDepartment",
  name: "部门",
  locales: {
    "en-US": {
      name: "Department",
    },
    "zh-CN": {
      name: "部门",
    },
  },
  fields: [
    {
      code: "parent",
      name: "上级部门",
      type: "relation",
      targetSingularCode: "oc_department",
      targetIdColumnName: "parent_id",
      locales: {
        "en-US": {
          name: "Parent Department",
        },
        "zh-CN": {
          name: "上级部门",
        },
      },
    },
    {
      code: "code",
      name: "Code",
      type: "text",
      locales: {
        "en-US": {
          name: "Code",
        },
        "zh-CN": {
          name: "编码",
        },
      },
    },
    {
      code: "name",
      name: "名称",
      type: "text",
      locales: {
        "en-US": {
          name: "Name",
        },
        "zh-CN": {
          name: "名称",
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
      },
    },
    {
      code: "users",
      name: "用户",
      type: "relation[]",
      targetSingularCode: "oc_user",
      selfIdColumnName: "department_id",
      entityDeletingReaction: "unlink",
      locales: {
        "en-US": {
          name: "Users",
        },
        "zh-CN": {
          name: "用户",
        },
      },
    },
  ],
};

export default entity;
