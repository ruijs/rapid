import { RpdDataModel } from "~/types";

export default {
  maintainedBy: "stateMachinePlugin",
  namespace: "svc",
  name: "state_machine",
  singularCode: "state_machine",
  pluralCode: "state_machines",
  schema: "public",
  tableName: "state_machines",
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
