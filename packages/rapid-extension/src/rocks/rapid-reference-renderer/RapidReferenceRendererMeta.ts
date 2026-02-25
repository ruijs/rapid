import { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "rapidReferenceRenderer",

  slots: {
    itemRenderer: {
      allowMultiComponents: false,
      required: false,
      toRenderProp: true,
      argumentsToProps: true,
      argumentNames: ["value"],
    },
  },

  propertyPanels: [
    {
      $type: "componentPropPanel",
      setters: [
        {
          $type: "textPropSetter",
          label: "valueFieldName",
          propName: "valueFieldName",
        },

        {
          $type: "textPropSetter",
          label: "textFieldName",
          propName: "textFieldName",
        },
      ],
    },
  ],
} as RockMeta;
