import { RockConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { CSSProperties } from "react";

export interface RapidDoubleColumnLayoutRockConfig extends SimpleRockConfig {
  layoutCacheId: string;
  defaultFixedColumnWidth?: number;
  resizable?: boolean;
  fixedColumn?: "left" | "right";
  className?: string;
  style?: CSSProperties;
  flexChildren?: RockConfig | RockConfig[];
  fixedChildren?: RockConfig | RockConfig[];
}
