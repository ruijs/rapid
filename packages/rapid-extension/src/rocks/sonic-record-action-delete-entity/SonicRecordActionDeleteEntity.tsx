import { MoveStyleUtils, RockEventHandlerNotifyEvent, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicRecordActionDeleteEntityMeta";
import type { SonicRecordActionDeleteEntityConfig, SonicRecordActionDeleteEntityRockConfig } from "./sonic-record-action-delete-entity-types";
import { omit } from "lodash";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const { framework } = context;
    const rockConfig: RockConfig = {
      ...(MoveStyleUtils.omitSystemRockConfigFields(omit(props, ["confirmTitle", "confirmText"]) as any) as SonicRecordActionDeleteEntityConfig),
      $type: "rapidTableAction",
      actionText: props.actionText || getExtensionLocaleStringResource(framework, "delete"),
      recordId: props.recordId,
      onAction: [
        {
          $action: "notifyEvent",
          eventName: "onDeleteEntityButtonClick",
          args: [
            {
              recordId: props.recordId,
              confirmTitle: props.confirmTitle,
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
