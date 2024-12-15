import { MoveStyleUtils, RockEventHandlerNotifyEvent, type Rock } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicRecordActionEditEntityMeta";
import type { SonicRecordActionEditEntityConfig, SonicRecordActionEditEntityRockConfig } from "./sonic-record-action-edit-entity-types";
import { RapidTableActionRockConfig } from "../rapid-table-action/rapid-table-action-types";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const { framework } = context;
    const rockConfig: RapidTableActionRockConfig = {
      ...(MoveStyleUtils.omitSystemRockConfigFields(props) as SonicRecordActionEditEntityConfig),
      $type: "rapidTableAction",
      actionText: props.actionText || getExtensionLocaleStringResource(framework, "edit"),
      onAction: [
        {
          $action: "notifyEvent",
          eventName: "onEditEntityButtonClick",
          $exps: {
            args: "$event.args",
          },
        } satisfies RockEventHandlerNotifyEvent,
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidEntityListMeta,
} as Rock<SonicRecordActionEditEntityRockConfig>;
