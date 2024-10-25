import { RockConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { CSSProperties, ReactNode } from "react";
import { PointerHitAreaMargins } from "react-resizable-panels";

interface IBaseLayoutProps {
  className?: string;
  style?: CSSProperties;
}

interface IPanelLayout {
  key?: string;
  kind: "panel";
  /**
   * 0 ~ 100
   */
  defaultSize: number;
  children: RockConfig;
  maxSize?: number | undefined;
  minSize?: number | undefined;
  props?: IBaseLayoutProps;
}

export interface IPanelGroupLayout {
  key?: string;
  kind: "group";
  direction?: "horizontal" | "vertical";
  layouts: (IPanelLayout | IPanelHandleLayout)[];
  props?: IBaseLayoutProps;
}

interface IPanelHandleLayout {
  key?: string;
  kind: "resizehandle";
  disabled?: boolean;
  hitAreaMargins?: PointerHitAreaMargins;
  props?: IBaseLayoutProps;
}

export interface RapidResizableLayoutRockConfig extends SimpleRockConfig, IBaseLayoutProps {
  resizable?: boolean;
  direction?: "horizontal" | "vertical";
  layoutCacheId?: string;
  layouts: IPanelGroupLayout["layouts"];
}
