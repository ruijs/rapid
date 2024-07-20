import { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "rapidImageRenderer",

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "switchPropSetter",
          label: "preview",
          propName: "preview",
          defaultValue: true,
        },
      ],
    },
  ],
} as RockMeta;
