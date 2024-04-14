import { MoveStyleUtils, type Rock } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicRecordActionEditEntityMeta";
import type { SonicRecordActionEditEntityConfig, SonicRecordActionEditEntityRockConfig } from "./sonic-record-action-edit-entity-types";
import { RapidTableActionRockConfig } from "../rapid-table-action/rapid-table-action-types";

export default {
  onInit(context, props) {
  },

  onReceiveMessage(message, state, props) {
  },

  Renderer(context, props) {
    const rockConfig: RapidTableActionRockConfig = {
      ...(MoveStyleUtils.omitSystemRockConfigFields(props) as SonicRecordActionEditEntityConfig),
      $type: "rapidTableAction",
      onAction: [
        {
          $action: "notifyEvent",
          eventName: "onEditEntityButtonClick",
        },
      ]
    }

    return renderRock({context, rockConfig});
  },

  ...RapidEntityListMeta
} as Rock<SonicRecordActionEditEntityRockConfig>;