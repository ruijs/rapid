import { MoveStyleUtils, RuiEvent, handleComponentEvent, type Rock, type RockConfig } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidFormModalRecordActionMeta from "./RapidFormModalRecordActionMeta";
import type { RapidFormModalRecordActionRockConfig } from "./rapid-form-modal-record-action-types";
import { cloneDeep, set } from "lodash";
import { message } from "antd";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const { resetFormOnModalOpen } = props;

    // TODO: need a better implementation. a component should not care about whether it's in a slot.
    const slotIndex = props.$slot.index || "0";
    const formRockId = `${props.$id}-form-${slotIndex}`;
    const formRockConfig = cloneDeep(props.form);
    formRockConfig.$id = formRockId;

    formRockConfig.onFormSubmit = [
      {
        $action: "script",
        script: async (event: RuiEvent) => {
          event.scope.setVars({
            "modal-saving": true,
          });

          try {
            if (props.onFormSubmit) {
              await handleComponentEvent("onFormSubmit", event.framework, event.page as any, event.scope, event.sender, props.onFormSubmit, [event.args[0]]);
            }

            event.scope.setVars({
              "modal-saving": false,
              "modal-open": false,
            });
            message.success(props.successMessage);
          } catch (ex) {
            event.scope.setVars({
              "modal-saving": false,
            });
            let errMsg = ex.message;
            if (props.errorMessage) {
              errMsg = props.errorMessage + errMsg;
            }
            message.error(errMsg);
          }
        },
      },
    ];
    set(formRockConfig, "$exps._hidden", "!$scope.vars['modal-open']");

    const actionLinkRockConfig: RockConfig = {
      ...MoveStyleUtils.omitSystemRockConfigFields(props),
      $id: `${props.$id}-link-${slotIndex}`,
      $type: "rapidTableAction",
      onAction: [
        {
          $action: "setVars",
          vars: {
            "modal-open": true,
          },
        },
        ...(resetFormOnModalOpen
          ? [
              {
                $action: "sendComponentMessage",
                componentId: formRockId,
                message: {
                  name: "resetFields",
                },
              },
            ]
          : []),
        {
          $action: "handleEvent",
          eventName: "onModalOpen",
          handlers: props.onModalOpen,
        },
      ],
    };

    const modalRockConfig: RockConfig = {
      $type: "antdModal",
      $id: `${props.$id}-modal-${slotIndex}`,
      title: props.modalTitle || props.text,
      $exps: {
        open: "!!$scope.vars['modal-open']",
        confirmLoading: "!!$scope.vars['modal-saving']",
      },
      children: formRockConfig,
      onOk: [
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
      $id: `${props.$id}-scope-${slotIndex}`,
      children: [actionLinkRockConfig, modalRockConfig],
    };

    return renderRock({ context, rockConfig: rockConfig });
  },

  ...RapidFormModalRecordActionMeta,
} as Rock<RapidFormModalRecordActionRockConfig>;
