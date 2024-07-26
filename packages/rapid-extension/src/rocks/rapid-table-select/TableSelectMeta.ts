import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "rapidTableSelect",

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
