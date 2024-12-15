import { MoveStyleUtils, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicToolbarRefreshButtonMeta";
import type { SonicToolbarRefreshButtonRockConfig } from "./sonic-toolbar-refresh-button-types";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const { framework } = context;

    const rockConfig: RockConfig = {
      ...MoveStyleUtils.omitSystemRockConfigFields(props),
      $type: "rapidToolbarButton",
      text: props.text || getExtensionLocaleStringResource(framework, "refresh"),
      onAction: [
        {
          $action: "notifyEvent",
          eventName: "onRefreshButtonClick",
        },
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidEntityListMeta,
} as Rock<SonicToolbarRefreshButtonRockConfig>;
