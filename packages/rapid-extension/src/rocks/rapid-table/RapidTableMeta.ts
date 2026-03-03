import { RockMeta } from "@ruiapp/move-style";
import { RAPID_TABLE_ROCK_TYPE } from "./rapid-table-types";

export default {
  $type: RAPID_TABLE_ROCK_TYPE,

  props: {
    rowKey: {
      valueType: "string",
      defaultValue: "id",
    },
  },

  slots: {},

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "jsonPropSetter",
          label: "dataSource",
          propName: "dataSource",
        },

        {
          $type: "textPropSetter",
          label: "rowKey",
          propName: "rowKey",
        },

        {
          $type: "selectPropSetter",
          label: "size",
          propName: "size",
          options: [
            {
              label: "default",
              value: "default",
            },
            {
              label: "large",
              value: "large",
            },
            {
              label: "middle",
              value: "middle",
            },
            {
              label: "small",
              value: "small",
            },
          ],
        },

        {
          $type: "switchPropSetter",
          label: "bordered",
          propName: "bordered",
        },
      ],
    },
  ],
} as RockMeta;
