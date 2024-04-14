import type { SimpleRockConfig } from "@ruiapp/move-style";
import type { RapidActionButtonBase } from "../../types/rapid-action-types";

export type RapidToolbarLinkConfig = RapidActionButtonBase & {
  url: string;
}

export interface RapidToolbarLinkRockConfig extends SimpleRockConfig, RapidToolbarLinkConfig {
}