import { Rock } from "@ruiapp/move-style";
import RapidTextRendererMeta from "./RapidTextRendererMeta";
import { RapidTextRendererProps, RapidTextRendererRockConfig } from "./rapid-text-renderer-types";
import { isNull, isUndefined } from "lodash";

export function configRapidTextRenderer(config: RapidTextRendererRockConfig): RapidTextRendererRockConfig {
  return config;
}

export function RapidTextRenderer(props: RapidTextRendererProps) {
  const { value, defaultText } = props;

  if (isUndefined(value) || isNull(value)) {
    return defaultText || "";
  }

  return value.toString();
}

export default {
  $type: "rapidTextRenderer",
  Renderer(context, props: RapidTextRendererRockConfig) {
    return RapidTextRenderer(props);
  },
  ...RapidTextRendererMeta,
} as Rock<RapidTextRendererRockConfig>;
