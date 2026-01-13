import type { ContainerRockConfig, RockConfig } from "@ruiapp/move-style";
import { CSSProperties } from "react";

export interface RapidPageSectionConfig {
  title?: string;
  style?: CSSProperties;
  actions?: RockConfig[];
}

export type RapidPageSectionRockConfig = ContainerRockConfig & RapidPageSectionConfig;
