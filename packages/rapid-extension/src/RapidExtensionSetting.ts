import { merge } from "lodash";
import { RapidFieldType } from "./types/rapid-entity-types";

const fieldTypeToDisplayRockTypeMap: Record<RapidFieldType, string> = {
  text: "rapidTextRenderer",
  integer: "rapidNumberRenderer",
  long: "rapidNumberRenderer",
  float: "rapidNumberRenderer",
  double: "rapidNumberRenderer",
  decimal: "rapidNumberRenderer",
  boolean: "rapidBoolRenderer",
  date: "rapidDateTimeRenderer",
  time: "rapidTextRenderer",
  datetime: "rapidDateTimeRenderer",
  option: "rapidOptionFieldRenderer",
  "option[]": "rapidOptionFieldRenderer",
  relation: "rapidObjectRenderer",
  "relation[]": "rapidObjectRenderer",
  json: "rapidJsonRenderer",
  file: "rapidFileInfoRenderer",
  "file[]": "rapidFileInfoRenderer",
  image: "rapidImageRenderer",
  "image[]": "rapidImageRenderer",
  richText: "rapidRichTextRenderer",
};

const defaultDisplayPropsOfFieldType: Record<string, Record<string, any>> = {
  date: {
    format: "YYYY-MM-DD",
  },

  datetime: {
    format: "YYYY-MM-DD HH:mm:ss",
  },

  boolean: {
    trueText: "是",
    falseText: "否",
    defaultText: "-",
  },
};

const defaultRendererPropsOfRendererTypes: Record<string, Record<string, any>> = {};

export default {
  getDefaultRendererTypeOfFieldType(fieldType: RapidFieldType) {
    return fieldTypeToDisplayRockTypeMap[fieldType] || "rapidTextRenderer";
  },

  setDefaultRendererPropsOfFieldType(fieldType: RapidFieldType, defaultRendererProps: Record<string, any>) {
    const originProps = defaultDisplayPropsOfFieldType[fieldType];
    const mergedProps = merge({}, originProps, defaultRendererProps);
    defaultDisplayPropsOfFieldType[fieldType] = mergedProps;
  },

  setDefaultRendererPropsOfRendererType(rendererType: string, defaultRendererProps: Record<string, any>) {
    const originProps = defaultRendererPropsOfRendererTypes[rendererType];
    const mergedProps = merge({}, originProps, defaultRendererProps);
    defaultRendererPropsOfRendererTypes[rendererType] = mergedProps;
  },

  getDefaultRendererProps(fieldType: RapidFieldType, rendererType: string) {
    const propsOfFieldType = defaultDisplayPropsOfFieldType[fieldType];
    const propsOfRendererType = defaultRendererPropsOfRendererTypes[rendererType];
    return merge({}, propsOfFieldType, propsOfRendererType);
  },
};
