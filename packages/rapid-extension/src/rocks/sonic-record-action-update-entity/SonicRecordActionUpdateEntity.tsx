import { MoveStyleUtils, RockEventHandlerNotifyEvent, type Rock } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicRecordActionUpdateEntityMeta";
import type { SonicRecordActionUpdateEntityConfig, SonicRecordActionUpdateEntityRockConfig } from "./sonic-record-action-update-entity-types";
import { RapidTableActionRockConfig } from "../rapid-table-action/rapid-table-action-types";
import { omit } from "lodash";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const rockConfig: RapidTableActionRockConfig = {
      ...(MoveStyleUtils.omitSystemRockConfigFields(omit(props, ["confirmTitle", "confirmText"]) as any) as SonicRecordActionUpdateEntityConfig),
      $type: "rapidTableAction",
      onAction: [
        {
          $action: "notifyEvent",
          eventName: "onUpdateEntityButtonClick",
          args: [
            {
              recordId: props.recordId,
              confirmTitle: props.confirmTitle,
              confirmText: props.confirmText,
              entity: props.entity,
            },
          ],
        } satisfies RockEventHandlerNotifyEvent,
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidEntityListMeta,
} as Rock<SonicRecordActionUpdateEntityRockConfig>;
