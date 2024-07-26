import type { Rock } from "@ruiapp/move-style";
import TableSingleSelectorMeta from "./TableSingleSelectorMeta";
import type { TableSingleSelectorRockConfig } from "./table-single-selector-types";
import { renderRock } from "@ruiapp/react-renderer";
import { omit } from "lodash";

export default {
  Renderer(context, props: TableSingleSelectorRockConfig) {
    return renderRock({
      context,
      rockConfig: {
        $type: "tableSelector",
        $id: `${props.id}_single`,
        ...omit(props, ["$type", "$id"]),
      },
    });
  },

  ...TableSingleSelectorMeta,
} as Rock;
