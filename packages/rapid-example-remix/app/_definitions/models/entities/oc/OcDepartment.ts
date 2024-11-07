import type { TDictionaryCodes } from "../../../meta/data-dictionary-codes";
import type { TEntitySingularCodes } from "../../../meta/model-codes";
import type { RapidEntity } from "@ruiapp/rapid-extension";

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: "app",
  code: "OcDepartment",
  name: "部门",
  fields: [
    {
      code: "parent",
      name: "上级部门",
      type: "relation",
      targetSingularCode: "oc_department",
      targetIdColumnName: "parent_id",
    },
    {
      code: "code",
      name: "Code",
      type: "text",
    },
    {
      code: "name",
      name: "名称",
      type: "text",
    },
    {
      code: "orderNum",
      name: "排序",
      type: "integer",
      required: true,
    },
    {
      code: "users",
      name: "用户",
      type: "relation[]",
      targetSingularCode: "oc_user",
      selfIdColumnName: "department_id",
      entityDeletingReaction: "unlink",
    },
  ],
};

export default entity;
