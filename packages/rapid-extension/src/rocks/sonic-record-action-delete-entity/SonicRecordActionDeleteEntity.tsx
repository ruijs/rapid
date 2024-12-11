import { MoveStyleUtils, RockEventHandlerNotifyEvent, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicRecordActionDeleteEntityMeta";
import type { SonicRecordActionDeleteEntityConfig, SonicRecordActionDeleteEntityRockConfig } from "./sonic-record-action-delete-entity-types";
import { omit } from "lodash";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const { framework } = context;
    const rockConfig: RockConfig = {
      ...(MoveStyleUtils.omitSystemRockConfigFields(omit(props, ["confirmText"]) as any) as SonicRecordActionDeleteEntityConfig),
      $type: "rapidTableAction",
      actionText: props.actionText || framework.getLocaleStringResource("rapid-extension", "delete"),
      recordId: props.recordId,
      onAction: [
        {
          $action: "notifyEvent",
          eventName: "onDeleteEntityButtonClick",
          args: [
            {
              recordId: props.recordId,
              confirmText: props.confirmText,
            },
          ],
        } satisfies RockEventHandlerNotifyEvent,
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidEntityListMeta,
} as Rock<SonicRecordActionDeleteEntityRockConfig>;
