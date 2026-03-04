import type { RockMeta } from "@ruiapp/move-style";
import { RAPID_TABLE_SELECT_ROCK_TYPE } from "./rapid-table-select-types";

export default {
  $type: RAPID_TABLE_SELECT_ROCK_TYPE,

  slots: {},

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "textPropSetter",
          label: "名称",
          propName: "$name",
        },
        {
          $type: "jsonPropsSetter",
          label: "列",
          propNames: ["columns"],
        },
      ],
    },
  ],
} as RockMeta;
