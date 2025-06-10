import { handleComponentEvent, MoveStyleUtils, RockEvent, RockEventHandler, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./RapidToolbarFormModalButtonMeta";
import type { RapidToolbarFormModalButtonRockConfig } from "./rapid-toolbar-form-modal-button-types";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const { onAction } = props;
    const buttonRockConfig: RockConfig = {
      ...MoveStyleUtils.omitSystemRockConfigFields(props),
      $id: `${props.$id}-btn`,
      $type: "rapidToolbarButton",
      onAction: [
        {
          $action: "script",
          script: async (event: RockEvent) => {
            await handleComponentEvent("onAction", event.framework, event.page as any, event.scope, event.sender, onAction, []);
          },
        },
        {
          $action: "setVars",
          vars: {
            "modal-open": true,
          },
        },
        {
          $action: "handleEvent",
          eventName: "onModalOpen",
          handlers: props.onModalOpen,
        },
      ],
    };

    const formRockId = `${props.$id}-form`;
    let modalBody: RockConfig | RockConfig[] = null;
    if (props.form) {
      const formRockConfig: RockConfig = {
        $id: formRockId,
        ...props.form,
        onFormSubmit: [
          {
            $action: "setVars",
            vars: {
              "modal-saving": true,
            },
          },
        ],
        onSaveSuccess: [
          {
            $action: "setVars",
            vars: {
              "modal-saving": false,
              "modal-open": false,
            },
          },
          ...((props.form.onSaveSuccess as RockEventHandler[]) || []),
          ...((props.onSaveSuccess as RockEventHandler[]) || []),
        ],
        onSaveError: [
          {
            $action: "setVars",
            vars: {
              "modal-saving": false,
            },
          },
          ...((props.form.onSaveError as RockEventHandler[]) || []),
          ...((props.onSaveError as RockEventHandler[]) || []),
        ],
      };
      modalBody = formRockConfig;
    } else {
      modalBody = props.modalBody || [];
    }

    const modalRockConfig: RockConfig = {
      $type: "antdModal",
      $id: `${props.$id}-modal`,
      title: props.modalTitle || props.text,
      $exps: {
        open: "!!$scope.vars['modal-open']",
        confirmLoading: "!!$scope.vars['modal-saving']",
      },
      children: modalBody,
      onOk: [
        {
          $action: "handleEvent",
          eventName: "onModalOk",
          handlers: props.onModalOk,
        },
        {
          $action: "sendComponentMessage",
          componentId: formRockId,
          message: {
            name: "submit",
          },
        },
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
          },
        },
      ],
    };

    const rockConfig: RockConfig = {
      $type: "scope",
      $id: `${props.$id}-scope`,
      children: [buttonRockConfig, modalRockConfig],
    };

    return renderRock({ context, rockConfig: rockConfig });
  },

  ...RapidEntityListMeta,
} as Rock<RapidToolbarFormModalButtonRockConfig>;
