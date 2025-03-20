import { MoveStyleUtils, RockEventHandler, RockEventHandlerNotifyEvent, RockInstanceContext, type Rock } from "@ruiapp/move-style";
import { renderRock } from "@ruiapp/react-renderer";
import RapidEntityListMeta from "./SonicRecordActionEditEntityMeta";
import type { SonicRecordActionEditEntityConfig, SonicRecordActionEditEntityRockConfig } from "./sonic-record-action-edit-entity-types";
import { RapidTableActionRockConfig } from "../rapid-table-action/rapid-table-action-types";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";
import { omit } from "lodash";

export default {
  onInit(context, props) {},

  onReceiveMessage(message, state, props) {},

  Renderer(context, props) {
    const { form } = props;

    if (form) {
      return renderActionWithSpecifiedForm(context, props);
    } else {
      return renderActionWithDefaultForm(context, props);
    }
  },

  ...RapidEntityListMeta,
} as Rock<SonicRecordActionEditEntityRockConfig>;

function renderActionWithDefaultForm(context: RockInstanceContext, props: SonicRecordActionEditEntityRockConfig) {
  const { framework } = context;
  const slotIndex = props.$slot.index || "0";

  const rockConfig: RapidTableActionRockConfig = {
    ...(MoveStyleUtils.omitSystemRockConfigFields(props) as SonicRecordActionEditEntityConfig),
    $id: `${props.$id}-link-${slotIndex}`,
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
}

function renderActionWithSpecifiedForm(context: RockInstanceContext, props: SonicRecordActionEditEntityRockConfig) {
  const slotIndex = props.$slot.index || "0";
  const entityId = props.$slot.record.id;
  const scopeId = context.scope.config.$id;
  const { entityCode, form, dataSourceCode } = props;

  const rockConfig: RapidTableActionRockConfig = {
    ...(MoveStyleUtils.omitSystemRockConfigFields(props) as SonicRecordActionEditEntityConfig),
    $id: `${props.$id}-action`,
    $type: "rapidFormModalRecordAction",
    form: {
      $type: "rapidEntityForm",
      ...omit(form, ["entityCode"]),
      entityCode: entityCode,
      mode: "edit",
      entityId,
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
        ...(form.onSaveSuccess
          ? (form.onSaveSuccess as RockEventHandler[])
          : [
              {
                $action: "loadStoreData",
                scopeId,
                storeName: dataSourceCode,
              },
            ]),
      ],
      onSaveError: [
        {
          $action: "setVars",
          vars: {
            "modal-saving": false,
          },
        },
        ...((form.onSaveError as RockEventHandler[]) || []),
      ],
    },
    onModalOpen: [
      {
        $action: "loadStoreData",
        scope: `${props.$id}-action-${slotIndex}`,
        storeName: "detail",
      },
    ],
  };

  return renderRock({ context, rockConfig });
}
