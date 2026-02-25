import { Rock } from "@ruiapp/move-style";
import RapidPercentRendererMeta from "./RapidPercentRendererMeta";
import { RapidPercentRendererProps, RapidPercentRendererRockConfig } from "./rapid-percent-renderer-types";
import { isNull, isString, isUndefined } from "lodash";

export function configRapidPercentRenderer(config: RapidPercentRendererRockConfig): RapidPercentRendererRockConfig {
  return config;
}

export function RapidPercentRenderer(props: RapidPercentRendererProps) {
  const { defaultText, usingThousandSeparator, decimalPlaces, roundingMode } = props;
  let { value } = props;

  if (isUndefined(value) || isNull(value)) {
    return defaultText || "";
  }

  if (isString(value)) {
    value = parseFloat(value);
  }

  const useGrouping = !!usingThousandSeparator;

  if (roundingMode !== "halfExpand" && decimalPlaces) {
    const powNum = Math.pow(10, decimalPlaces);
    if (roundingMode === "ceil") {
      value = Math.ceil(value * powNum) / powNum;
    } else if (roundingMode === "floor") {
      value = Math.floor(value * powNum) / powNum;
    }
  }

  return Intl.NumberFormat("Zh-cn", {
    style: "percent",
    minimumFractionDigits: decimalPlaces,
    useGrouping: useGrouping,
  }).format(value);
}

export default {
  Renderer(context, props: RapidPercentRendererRockConfig) {
    return RapidPercentRenderer(props);
  },
  ...RapidPercentRendererMeta,
} as Rock<RapidPercentRendererRockConfig>;
