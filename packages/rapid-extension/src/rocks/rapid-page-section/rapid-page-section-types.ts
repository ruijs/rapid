import type { ContainerRockConfig } from "@ruiapp/move-style";
import { CSSProperties } from "react";

export interface RapidPageSectionConfig {
  title?: string;
  style?: CSSProperties;
}

export type RapidPageSectionRockConfig = ContainerRockConfig & RapidPageSectionConfig;
