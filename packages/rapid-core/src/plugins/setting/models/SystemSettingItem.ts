import { RpdDataModel } from "~/types";

export default {
  maintainedBy: "settingPlugin",
  namespace: "svc",
  name: "system_setting_item",
  singularCode: "system_setting_item",
  pluralCode: "system_setting_items",
  schema: "public",
  tableName: "system_setting_items",
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
      name: "groupCode",
      code: "groupCode",
      columnName: "group_code",
      type: "text",
      required: true,
    },
    {
      name: "itemCode",
      code: "itemCode",
      columnName: "item_code",
      type: "text",
      required: true,
    },
    {
      name: "value",
      code: "value",
      columnName: "value",
      type: "json",
      required: false,
    },
  ],
} as RpdDataModel;
