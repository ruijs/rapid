import { handleComponentEvent, Rock, RockConfig, RockEvent } from "@ruiapp/move-style";
import RapidToolbarMeta from "./RapidToolbarButtonMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { RapidToolbarButtonRockConfig } from "./rapid-toolbar-button-types";
import { Modal } from "antd";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";

export default {
  $type: "rapidToolbarButton",

  Renderer(context, props: RapidToolbarButtonRockConfig) {
    const { framework } = context;
    const { onAction, confirmTitle, confirmText, tooltipTitle, tooltipColor } = props;
    const actionEventName = props.actionEventName || "onClick";

    const buttonRockConfig: RockConfig = {
      $id: `${props.$id}-button`,
      $type: "antdButton",
      type: props.actionStyle,
      danger: !!props.danger,
      ghost: !!props.ghost,
      icon: props.icon ? { $type: "antdIcon", name: props.icon } : null,
      size: props.size,
      disabled: props.disabled,
      children: {
        $type: "htmlElement",
        htmlTag: "span",
        children: {
          $type: "text",
          text: props.text,
        },
      },
    };

    if (props.actionType === "pageLink") {
      buttonRockConfig.href = `/pages/${props.pageCode}`;
    } else if (props.actionType === "link") {
      buttonRockConfig.href = props.url;
    }

    if (onAction) {
      buttonRockConfig[actionEventName] = [
        {
          $action: "script",
          script: (event: RockEvent) => {
            if (confirmText) {
              Modal.confirm({
                title: confirmTitle,
                content: confirmText,
                okText: getExtensionLocaleStringResource(framework, "ok"),
                cancelText: getExtensionLocaleStringResource(framework, "cancel"),
                onOk: async () => {
                  handleComponentEvent("onAction", event.framework, event.page as any, event.scope, event.sender, onAction, []);
                },
              });
            } else {
              handleComponentEvent("onAction", event.framework, event.page as any, event.scope, event.sender, onAction, []);
            }
          },
        },
      ];
    }

    let toolTipRockConfig: RockConfig | null = null;
    if (tooltipTitle) {
      toolTipRockConfig = {
        $id: `${props.$id}-tooltip`,
        $type: "antdTooltip",
        title: tooltipTitle,
        color: tooltipColor,
        children: buttonRockConfig,
      };
    }

    return renderRock({ context, rockConfig: toolTipRockConfig || buttonRockConfig });
  },

  ...RapidToolbarMeta,
} as Rock;
