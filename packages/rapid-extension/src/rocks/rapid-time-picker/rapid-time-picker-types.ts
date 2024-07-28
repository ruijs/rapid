import type { RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";

export type RapidTimePickerConfig = {};

export interface RapidTimePickerRockConfig extends SimpleRockConfig, RapidTimePickerConfig {
  onChange?: RockEventHandlerConfig;
}
