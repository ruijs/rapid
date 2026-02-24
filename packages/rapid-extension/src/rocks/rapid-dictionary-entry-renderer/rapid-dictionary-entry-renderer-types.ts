import { RockConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidDataDictionaryEntry } from "@ruiapp/rapid-common";

export type RapidDictionaryEntryRendererConfig = {
  value?: RapidDataDictionaryEntry;
};

export interface RapidDictionaryEntryRendererRockConfig extends SimpleRockConfig, RapidDictionaryEntryRendererConfig {}
