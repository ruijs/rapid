import { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "rapidFileInfoRenderer",

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "switchPropSetter",
          label: "showFileSize",
          propName: "showFileSize",
        },
      ],
    },
  ],
} as RockMeta;
