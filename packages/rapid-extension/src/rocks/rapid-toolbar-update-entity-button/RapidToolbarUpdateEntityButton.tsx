import { fireEvent, omitSystemRockConfigFields, Rock, RockConfig, RockEvent, RockEventHandlerConfig, wait } from "@ruiapp/move-style";
import RapidToolbarUpdateEntityButtonMeta from "./RapidToolbarUpdateEntityButtonMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { RapidToolbarUpdateEntityButtonRockConfig } from "./rapid-toolbar-update-entity-button-types";
import { find, omit } from "lodash";
import rapidAppDefinition from "../../rapidAppDefinition";
import { message } from "antd";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";
import { getRapidApi } from "../../rapidApi";

const UpdateEntityButtonPropNames = ["entity", "entityId", "entityCode", "successMessage", "errorMessage", "onSuccess", "onError"];

export default {
  $type: "rapidToolbarUpdateEntityButton",

  Renderer(context, props: RapidToolbarUpdateEntityButtonRockConfig) {
    const { framework } = context;

    const onAction: RockEventHandlerConfig = {
      $action: "script",
      script: async (event: RockEvent) => {
        const { framework, page, scope } = event;
        const entities = rapidAppDefinition.getEntities();
        const entityCode = props.entityCode;
        if (!entityCode) {
          message.error(`"entityCode" was not configured.`);
          return;
        }

        const mainEntity = find(entities, (item) => item.code === entityCode);
        if (!mainEntity) {
          message.error(`Entity with code "${entityCode}" was not found.`);
          return;
        }

        const rapidApi = getRapidApi();
        try {
          await rapidApi.patch(`${mainEntity.namespace}/${mainEntity.pluralCode}/${props.entityId}`, props.entity);

          const successMessage = props.successMessage ? props.successMessage : getExtensionLocaleStringResource(framework, "updateSuccess");
          message.success(successMessage);
          await wait(1000);

          if (props.onSuccess) {
            fireEvent({
              framework,
              page,
              scope,
              sender: event.sender,
              parentEvent: event,
              eventName: "onSuccess",
              eventHandlers: props.onSuccess,
              eventArgs: null,
            });
          }
        } catch (err: any) {
          const errorMessage = props.errorMessage
            ? `${props.errorMessage} ${err.message}`
            : getExtensionLocaleStringResource(framework, "updateError", { message: err.message });
          message.error(errorMessage);
          await wait(1000);

          if (props.onError) {
            fireEvent({
              framework,
              page,
              scope,
              sender: event.sender,
              parentEvent: event,
              eventName: "onError",
              eventHandlers: props.onError,
              eventArgs: null,
            });
          }
        }
      },
    };

    const rockConfig: RockConfig = {
      $id: `${props.$id}-rpdBtn`,
      $type: "rapidToolbarButton",
      ...omit(omitSystemRockConfigFields(props), UpdateEntityButtonPropNames),
      onAction,
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarUpdateEntityButtonMeta,
} as Rock;
