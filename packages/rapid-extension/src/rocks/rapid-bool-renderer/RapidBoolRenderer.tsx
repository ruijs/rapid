import { Rock, SimpleRockConfig } from "@ruiapp/move-style";
import RapidBoolRendererMeta from "./RapidBoolRendererMeta";

export interface RapidReferenceRendererProps extends SimpleRockConfig {
  value: boolean | null | undefined;
  strictEquals?: boolean;
  trueText?: string;
  falseText?: string;
  defaultText?: string;
}

export default {
  $type: "rapidBoolRenderer",

  Renderer(context, props: RapidReferenceRendererProps) {
    const { framework } = context;
    const { value, strictEquals, trueText, falseText, defaultText } = props;
    if (strictEquals) {
      if (value === true) {
        return trueText || framework.getLocaleStringResource("rapid-extension", "boolTrue");
      } else if (value === false) {
        return falseText || framework.getLocaleStringResource("rapid-extension", "boolFalse");
      } else {
        return defaultText || "";
      }
    } else {
      if (value) {
        return trueText || framework.getLocaleStringResource("rapid-extension", "boolTrue");
      } else {
        return falseText || framework.getLocaleStringResource("rapid-extension", "boolFalse");
      }
    }
  },

  ...RapidBoolRendererMeta,
} as Rock;
