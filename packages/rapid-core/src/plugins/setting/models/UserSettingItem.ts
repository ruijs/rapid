import { RpdDataModel } from "~/types";

export default {
  maintainedBy: "settingPlugin",
  namespace: "svc",
  name: "user_setting_item",
  singularCode: "user_setting_item",
  pluralCode: "user_setting_items",
  schema: "public",
  tableName: "user_setting_items",
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
      name: "userId",
      code: "userId",
      columnName: "user_id",
      type: "integer",
      required: true,
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
