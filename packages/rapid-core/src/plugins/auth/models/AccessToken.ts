import { RpdDataModel } from "~/types";

export default     {
  maintainedBy: "authManager",
  namespace: "auth",
  name: "access_token",
  singularCode: "access_token",
  pluralCode: "access_tokens",
  schema: "public",
  tableName: "access_tokens",
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
      name: "token",
      code: "token",
      columnName: "token",
      type: "text",
      required: true,
    },
    {
      name: "description",
      code: "description",
      columnName: "description",
      type: "text",
      required: false,
    },
    {
      name: "ownerType",
      code: "ownerType",
      columnName: "owner_type",
      type: "text",
      required: true,
    },
    {
      name: "ownerId",
      code: "ownerId",
      columnName: "owner_id",
      type: "integer",
      required: true,
    },
    {
      name: "expirationTime",
      code: "expirationTime",
      columnName: "expiration_time",
      type: "datetime",
      required: true,
    },
  ],
} as RpdDataModel;