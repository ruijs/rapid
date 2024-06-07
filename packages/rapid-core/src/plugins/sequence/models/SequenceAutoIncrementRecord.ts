import { RpdDataModel } from "~/types";

export default {
  maintainedBy: "sequencePlugin",
  namespace: "svc",
  name: "sequence_auto_increment_record",
  singularCode: "sequence_auto_increment_record",
  pluralCode: "sequence_auto_increment_records",
  schema: "public",
  tableName: "sequence_auto_increment_records",
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
      name: "ruleCode",
      code: "ruleCode",
      columnName: "rule_code",
      type: "text",
      required: true,
    },
    {
      name: "scope",
      code: "scope",
      columnName: "scope",
      type: "text",
      required: false,
    },
    {
      name: "currentValue",
      code: "currentValue",
      columnName: "current_value",
      type: "integer",
      required: true,
    },
    {
      name: "updatedAt",
      code: "updatedAt",
      columnName: "updated_at",
      type: "datetime",
      required: true,
    },
  ],
} as RpdDataModel;
