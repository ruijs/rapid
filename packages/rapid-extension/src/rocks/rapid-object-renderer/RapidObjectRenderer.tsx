import { MoveStyleUtils, Rock } from "@ruiapp/move-style";
import RapidObjectRendererMeta from "./RapidObjectRendererMeta";
import { RapidObjectRendererProps, RapidObjectRendererRockConfig } from "./rapid-object-renderer-types";

export function configRapidObjectRenderer(config: RapidObjectRendererRockConfig): RapidObjectRendererRockConfig {
  return config;
}

export function RapidObjectRenderer(props: RapidObjectRendererProps) {
  const { value, format, defaultText } = props;
  if (value) {
    if (!format) {
      // TODO: render items
      return value.toString();
    }
    return MoveStyleUtils.fulfillVariablesInString(format, value);
  } else {
    return defaultText || "";
  }
}

export default {
  $type: "rapidObjectRenderer",
  Renderer(context, props: RapidObjectRendererRockConfig) {
    return RapidObjectRenderer(props);
  },
  ...RapidObjectRendererMeta,
} as Rock;
