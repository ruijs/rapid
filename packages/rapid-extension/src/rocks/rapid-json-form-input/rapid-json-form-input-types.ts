import type { RockEventHandler, SimpleRockConfig } from "@ruiapp/move-style";

export type RapidJsonFormInputConfig = {
  value?: any;
  onChange?: RockEventHandler;
};

export interface RapidJsonFormInputRockConfig extends SimpleRockConfig, RapidJsonFormInputConfig {}
