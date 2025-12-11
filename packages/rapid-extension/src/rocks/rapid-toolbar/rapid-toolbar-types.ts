import type { RockConfig, SimpleRockConfig } from "@ruiapp/move-style";

export type RapidToolbarConfig = {
  extraClassName?: "";
  items?: RockConfig[];
  extras?: RockConfig[];
  rightExtras?: RockConfig[];
};

export interface RapidToolbarRockConfig extends SimpleRockConfig, RapidToolbarConfig {}
