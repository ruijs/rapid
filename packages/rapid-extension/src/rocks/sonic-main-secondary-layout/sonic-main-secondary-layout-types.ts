import type { RockConfig, RockEventHandlerConfig, SimpleRockConfig, StoreConfig } from "@ruiapp/move-style";
import { CSSProperties } from "react";

export interface SonicMainSecondaryLayoutConfig {
  stores?: StoreConfig[];
  gutter?: number;
  main: RockConfig;
  mainTitle?: string;
  mainColSpan: number;
  mainClassName?: string;
  secondary: RockConfig;
  secondaryTitle?: string;
  secondaryColSpan: number;
  secondaryClassName?: string;
  onSelectedIdsChange?: RockEventHandlerConfig;

  mode?: "layout" | "default";
  layoutCacheId?: string;
  layoutResizable?: boolean;
  layoutFixedColumn?: "left" | "right";
  layoutClassName?: string;
  layoutStyle?: CSSProperties;
  layoutDefaultFixedColumnWidth?: number;
}

export interface SonicMainSecondaryLayoutRockConfig extends SimpleRockConfig, SonicMainSecondaryLayoutConfig {}
