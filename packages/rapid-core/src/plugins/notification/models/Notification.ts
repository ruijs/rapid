import { RpdDataModel } from "~/types";

export default {
  maintainedBy: "notification",
  namespace: "svc",
  name: "notification",
  singularCode: "notification",
  pluralCode: "notifications",
  schema: "public",
  tableName: "notifications",
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
      name: "标题",
      code: "title",
      columnName: "title",
      type: "text",
      required: true,
    },
    {
      name: "内容",
      code: "content",
      columnName: "content",
      type: "text",
      required: false,
    },
    {
      name: "已读",
      code: "read",
      columnName: "read",
      type: "boolean",
      required: false,
      defaultValue: "false",
    },
    {
      name: "详细信息",
      code: "details",
      columnName: "details",
      description: '{"url": "", "actions": [{"text": "", "url": ""}]}',
      type: "json",
    },
    {
      name: "用户",
      code: "user",
      type: "relation",
      targetSingularCode: "oc_user",
      targetIdColumnName: "user_id",
    },
  ],
} as RpdDataModel;
