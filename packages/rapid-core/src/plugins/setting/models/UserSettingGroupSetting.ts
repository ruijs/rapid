import { RpdDataModel } from "~/types";

export default {
  maintainedBy: "settingPlugin",
  namespace: "svc",
  name: "user_setting_group_setting",
  singularCode: "user_setting_group_setting",
  pluralCode: "user_setting_group_settings",
  schema: "public",
  tableName: "user_setting_group_settings",
  properties: [
    {
      name: "id",
      code: "id",
      columnName: "id",
      type: "integer",
      required: true,
      autoIncrement: true,
    },
    {
      name: "code",
      code: "code",
      columnName: "code",
      type: "text",
      required: true,
    },
    {
      name: "name",
      code: "name",
      columnName: "scnameope",
      type: "text",
      required: false,
    },
    {
      name: "description",
      code: "description",
      columnName: "description",
      type: "text",
      required: false,
    },
    {
      name: "permissionAssignments",
      code: "permissionAssignments",
      columnName: "permission_assignments",
      type: "json",
      required: false,
    },
    {
      name: "items",
      code: "items",
      type: "relation[]",
      targetSingularCode: "user_setting_item_setting",
      selfIdColumnName: "group_id",
    },
  ],
} as RpdDataModel;
