import { MoveStyleUtils, Rock, RockChildrenConfig, RockConfig } from "@ruiapp/move-style";
import RapidLinkRendererMeta from "./RapidLinkRendererMeta";
import { RapidLinkRendererRockConfig } from "./rapid-link-renderer-types";
import { renderRock, toRenderRockSlot } from "@ruiapp/react-renderer";
import { isString } from "lodash";

export default {
  $type: "rapidLinkRenderer",

  Renderer(context, props: RapidLinkRendererRockConfig) {
    const { value, text, url, defaultText } = props;
    if (!value) {
      return defaultText || "";
    }

    let childrenConfig: RockChildrenConfig;
    if (isString(text)) {
      childrenConfig = {
        $id: `${props.$id}-text`,
        $type: "text",
        text: MoveStyleUtils.fulfillVariablesInString(text, value),
      };
    } else {
      childrenConfig = {
        ...text,
        $id: `${props.$id}-text`,
      };
    }

    const rockConfig: RockConfig = {
      $id: `${props.$id}`,
      $type: "anchor",
      href: MoveStyleUtils.fulfillVariablesInString(url, value),
      children: childrenConfig,
    };

    return renderRock({context, rockConfig});
  },

  ...RapidLinkRendererMeta,
} as Rock;