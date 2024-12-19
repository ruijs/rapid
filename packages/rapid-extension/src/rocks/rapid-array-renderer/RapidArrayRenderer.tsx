import { MoveStyleUtils, Rock, RockConfig } from "@ruiapp/move-style";
import RapidArrayRendererMeta from "./RapidArrayRendererMeta";
import { RapidArrayRendererRockConfig } from "./rapid-array-renderer-types";
import { get, set, map } from "lodash";
import { renderRock } from "@ruiapp/react-renderer";

export default {
  $type: "rapidArrayRenderer",

  Renderer(context, props: RapidArrayRendererRockConfig) {
    const { value, format, item, separator, noSeparator, listContainer, itemContainer, defaultText } = props;
    if (!value) {
      return defaultText || "";
    }

    if (item) {
      if (!get(item, "$exps.value")) {
        set(item, "$exps.value", "$slot.item");
      }
      const rockConfig: RockConfig = {
        $id: props.$id,
        $type: "list",
        listContainer,
        itemContainer,
        item,
        separator: noSeparator
          ? null
          : separator || {
              $type: "antdDivider",
              type: "vertical",
            },
        dataSource: value,
      };
      return renderRock({ context, rockConfig });
    } else if (format) {
      return map(value, (item) => {
        return MoveStyleUtils.fulfillVariablesInString(format, item);
      }).join(", ");
    }

    return "";
  },

  ...RapidArrayRendererMeta,
} as Rock;
