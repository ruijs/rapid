import { Rock } from "@ruiapp/move-style";
import RapidPercentRendererMeta from "./RapidPercentRendererMeta";
import { RapidPercentRendererRockConfig } from "./rapid-percent-renderer-types";
import { isNull, isString, isUndefined } from "lodash";

export default {
  $type: "rapidPercentRenderer",

  Renderer(context, props: RapidPercentRendererRockConfig) {
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
  },

  ...RapidPercentRendererMeta,
} as Rock;
