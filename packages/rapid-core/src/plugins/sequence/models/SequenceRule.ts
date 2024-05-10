import { RpdDataModel } from "~/types";

export default     {
  maintainedBy: "sequencePlugin",
  namespace: "svc",
  name: "sequence_rule",
  singularCode: "sequence_rule",
  pluralCode: "sequence_rules",
  schema: "public",
  tableName: "sequence_rules",
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
      name: "description",
      code: "description",
      columnName: "description",
      type: "text",
      required: false,
    },
    {
      name: "config",
      code: "config",
      columnName: "config",
      type: "json",
      required: false,
    },
  ],
} as RpdDataModel;