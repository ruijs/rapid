import { RpdDataModel } from "~/types";

export default {
  maintainedBy: "settingPlugin",
  namespace: "svc",
  name: "system_setting_group_setting",
  singularCode: "system_setting_group_setting",
  pluralCode: "system_setting_group_settings",
  schema: "public",
  tableName: "system_setting_group_settings",
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
      columnName: "name",
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
      targetSingularCode: "system_setting_item_setting",
      selfIdColumnName: "group_id",
    },
  ],
} as RpdDataModel;
