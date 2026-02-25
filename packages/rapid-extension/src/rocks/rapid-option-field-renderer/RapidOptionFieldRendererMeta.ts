import type { RockMeta } from "@ruiapp/move-style";

export default {
  $type: "rapidOptionFieldRenderer",

  slots: {
    separator: {
      allowMultiComponents: false,
      required: false,
      toRenderProp: true,
    },
    item: {
      allowMultiComponents: false,
      required: false,
      toRenderProp: true,
      argumentsToProps: true,
      argumentNames: ["value", "index"],
    },
    itemContainer: {
      allowMultiComponents: false,
      required: false,
      toRenderProp: true,
      argumentsToProps: true,
      argumentNames: ["children", "value", "index"],
    },
    listContainer: {
      allowMultiComponents: false,
      required: false,
      toRenderProp: true,
      argumentsToProps: true,
      argumentNames: ["children"],
    },
  },

  propertyPanels: [],
} as RockMeta;
