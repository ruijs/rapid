import type { Rock, RockConfig } from "@ruiapp/move-style";
import RapidToolbarMeta from "./RapidToolbarMeta";
import type { RapidToolbarRockConfig } from "./rapid-toolbar-types";
import { renderRock } from "@ruiapp/react-renderer";

import "./style.css";

export default {
  $type: "rapidToolbar",

  Renderer(context, props: RapidToolbarRockConfig) {
    const { extraClassName } = props;

    if (!props.items?.length && !props.extras?.length && !props.rightExtras?.length) {
      return <></>;
    }

    const className = extraClassName ? "rui-toolbar " + extraClassName : "rui-toolbar";
    const rockConfig: RockConfig = {
      $id: props.$id,
      $type: "box",
      className,
      children: [
        {
          $id: `${props.$id}-items`,
          $type: "htmlElement",
          htmlTag: "div",
          attributes: {
            className: "rui-toolbar-items",
          },
          children: props.items,
        },
        {
          $id: `${props.$id}-extras`,
          $type: "htmlElement",
          htmlTag: "div",
          attributes: {
            className: "rui-toolbar-extras",
          },
          children: [
            {
              $id: `${props.$id}-form`,
              $type: "antdForm",
              initialValues: {},
              children: [
                {
                  $type: "antdSpace",
                  $id: `${props.$id}-extras-space`,
                  children: props.extras,
                },
              ],
            },
            ...(props.rightExtras || []),
          ],
        },
      ],
    };
    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarMeta,
} as Rock;
