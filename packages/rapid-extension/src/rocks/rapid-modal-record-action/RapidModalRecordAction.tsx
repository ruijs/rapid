import { MoveStyleUtils, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidModalRecordActionMeta from "./RapidModalRecordActionMeta";
import type { RapidModalRecordActionRockConfig } from "./rapid-modal-record-action-types";

export default {
  onInit(context, props) {
  },

  onReceiveMessage(message, state, props) {
  },

  Renderer(context, props) {
    const actionLinkRockConfig: RockConfig = {
      ...MoveStyleUtils.omitSystemRockConfigFields(props),
      $id: `${props.$id}-link`,
      $type: "rapidTableAction",
      onAction: [
        {
          $action: "setVars",
          vars: {
            "modal-open": true,
          }
        },
        {
          $action: "handleEvent",
          eventName: "onModalOpen",
          handlers: props.onModalOpen,
        },
      ]
    };

    const modalRockConfig: RockConfig = {
      $type: "antdModal",
      $id: `${props.$id}-modal`,
      title: props.modalTitle || props.text,
      $exps: {
        open: "!!$scope.vars['modal-open']",
      },
      children: props.modalBody,
      onOk: [
        {
          $action: "handleEvent",
          eventName: "onModalOk",
          handlers: props.onModalOk,
        },
        // {
        //   $action: "setVars",
        //   vars: {
        //     "modal-open": false,
        //   }
        // },
      ],
      onCancel: [
        {
          $action: "handleEvent",
          eventName: "onModalCancel",
          handlers: props.onModalCancel,
        },
        {
          $action: "setVars",
          vars: {
            "modal-open": false,
          }
        }
      ],
    };

    const rockConfig: RockConfig = {
      $type: "scope",
      $id: `${props.$id}-scope`,
      children: [
        actionLinkRockConfig,
        modalRockConfig,
      ]
    }

    return renderRock({context, rockConfig: rockConfig});
  },

  ...RapidModalRecordActionMeta
} as Rock<RapidModalRecordActionRockConfig>;