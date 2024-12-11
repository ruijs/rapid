import { handleComponentEvent, Rock, RockConfig, RockEvent } from "@ruiapp/move-style";
import RapidToolbarMeta from "./RapidToolbarButtonMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { RapidToolbarButtonRockConfig } from "./rapid-toolbar-button-types";
import { Modal } from "antd";

export default {
  $type: "rapidToolbarButton",

  Renderer(context, props: RapidToolbarButtonRockConfig) {
    const { framework } = context;
    const { onAction, confirmText } = props;
    const actionEventName = props.actionEventName || "onClick";

    const rockConfig: RockConfig = {
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
      rockConfig.href = `/pages/${props.pageCode}`;
    } else if (props.actionType === "link") {
      rockConfig.href = props.url;
    }

    if (onAction) {
      rockConfig[actionEventName] = [
        {
          $action: "script",
          script: (event: RockEvent) => {
            if (confirmText) {
              Modal.confirm({
                title: confirmText,
                okText: framework.getLocaleStringResource("rapid-extension", "ok"),
                cancelText: framework.getLocaleStringResource("rapid-extension", "cancel"),
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
    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarMeta,
} as Rock;
