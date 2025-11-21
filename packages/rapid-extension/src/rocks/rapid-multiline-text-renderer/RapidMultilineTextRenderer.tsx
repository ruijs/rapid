import { Rock, SimpleRockConfig } from "@ruiapp/move-style";
import RapidBoolRendererMeta from "./RapidMultilineTextRendererMeta";

export interface RapidMultilineTextRendererProps extends SimpleRockConfig {
  value: string | null | undefined;
  defaultText?: string;
}

export default {
  $type: "rapidMultilineTextRenderer",

  Renderer(context, props: RapidMultilineTextRendererProps) {
    const { framework } = context;
    let { value, defaultText } = props;
    value ??= defaultText;

    return <pre>{value}</pre>;
  },

  ...RapidBoolRendererMeta,
} as Rock;
