import { Rock } from "@ruiapp/move-style";
import { Button } from "antd";
import RapidToolbarLinkMeta from "./RapidToolbarLinkMeta";
import { genRockRenderer } from "@ruiapp/react-renderer";
import { RapidToolbarLinkProps, RapidToolbarLinkRockConfig } from "./rapid-toolbar-link-types";
import AntdIcon from "../../components/antd-icon/AntdIcon";

export function configRapidToolbarLink(config: RapidToolbarLinkRockConfig): RapidToolbarLinkRockConfig {
  return config;
}

export function RapidToolbarLink(props: RapidToolbarLinkProps) {
  const { text, icon, actionStyle, danger, size, url, target, onAction, actionEventName = "onClick" } = props;

  const buttonProps: Record<string, any> = {
    type: actionStyle,
    danger,
    size,
    href: url,
    target,
  };

  if (onAction) {
    buttonProps[actionEventName] = onAction;
  }

  return (
    <Button {...buttonProps} icon={icon ? <AntdIcon name={icon} /> : undefined}>
      {text}
    </Button>
  );
}

export default {
  Renderer: genRockRenderer(RapidToolbarLinkMeta.$type, RapidToolbarLink),
  ...RapidToolbarLinkMeta,
} as Rock<RapidToolbarLinkRockConfig>;
