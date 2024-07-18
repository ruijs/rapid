import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "richTextEditor",

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
      ],
    },
  ],
} as RockMeta;
