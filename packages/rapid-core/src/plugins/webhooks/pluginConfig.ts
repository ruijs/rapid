import { RpdApplicationConfig } from "~/types";

export default {
  models: [
    {
      name: "webhook",
      namespace: "sys",
      singularCode: "webhook",
      pluralCode: "webhooks",
      schema: "public",
      tableName: "sys_webhooks",
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
          name: "name",
          code: "name",
          columnName: "name",
          type: "text",
          required: true,
        },
        {
          name: "url",
          code: "url",
          columnName: "url",
          type: "text",
          required: true,
        },
        {
          name: "secret",
          code: "secret",
          columnName: "secret",
          type: "text",
          required: false,
        },
        {
          name: "namespace",
          code: "namespace",
          columnName: "namespace",
          type: "text",
          required: true,
        },
        {
          name: "model singular code",
          code: "modelSingularCode",
          columnName: "model_singular_code",
          type: "text",
          required: true,
        },
        {
          name: "events",
          code: "events",
          columnName: "events",
          type: "json",
          required: false,
        },
        {
          name: "enabled",
          code: "enabled",
          columnName: "enabled",
          type: "boolean",
          required: true,
        },
      ],
    },
  ],
  dataDictionaries: [],
  routes: [],
} satisfies RpdApplicationConfig;
