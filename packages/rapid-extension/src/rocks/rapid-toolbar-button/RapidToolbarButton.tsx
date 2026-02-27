import { handleComponentEvent, Rock, RockInstance } from "@ruiapp/move-style";
import { Button, Modal, Tooltip } from "antd";
import RapidToolbarButtonMeta from "./RapidToolbarButtonMeta";
import { genRockRenderer } from "@ruiapp/react-renderer";
import { RapidToolbarButtonProps, RapidToolbarButtonRockConfig } from "./rapid-toolbar-button-types";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";
import AntdIcon from "../../components/antd-icon/AntdIcon";

export function configRapidToolbarButton(config: RapidToolbarButtonRockConfig): RapidToolbarButtonRockConfig {
  return config;
}

export function RapidToolbarButton(props: RapidToolbarButtonProps) {
  const { _context: context } = props as any as RockInstance;
  const { framework } = context;
  const {
    onAction,
    confirmTitle,
    confirmText,
    tooltipTitle,
    tooltipColor,
    text,
    icon,
    actionStyle,
    danger,
    ghost,
    size,
    disabled,
    actionEventName = "onClick",
    actionType,
    // @ts-ignore - deprecated property
    pageCode,
    url,
  } = props;

  let href: string | undefined;
  if ((actionType as any) === "pageLink") {
    href = `/pages/${pageCode}`;
  } else if (url) {
    href = url;
  }

  const handleClick = () => {
    if (!onAction) return;

    if (confirmText) {
      Modal.confirm({
        title: confirmTitle,
        content: confirmText,
        okText: getExtensionLocaleStringResource(framework, "ok"),
        cancelText: getExtensionLocaleStringResource(framework, "cancel"),
        onOk: async () => {
          onAction?.();
        },
      });
    } else {
      onAction?.();
    }
  };

  const buttonProps: Record<string, any> = {
    type: actionStyle,
    danger: !!danger,
    ghost: !!ghost,
    size,
    disabled,
    href,
  };

  if (onAction) {
    buttonProps[actionEventName] = handleClick;
  }

  const buttonElement = (
    <Button {...buttonProps} icon={icon ? <AntdIcon name={icon} /> : undefined}>
      <span>{text}</span>
    </Button>
  );

  if (tooltipTitle) {
    return (
      <Tooltip title={tooltipTitle} color={tooltipColor}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
}

export default {
  Renderer: genRockRenderer(RapidToolbarButtonMeta.$type, RapidToolbarButton),
  ...RapidToolbarButtonMeta,
} as Rock<RapidToolbarButtonRockConfig>;
