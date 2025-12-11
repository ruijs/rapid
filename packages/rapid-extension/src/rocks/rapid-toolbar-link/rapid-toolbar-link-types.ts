import type { SimpleRockConfig } from "@ruiapp/move-style";
import type { RapidToolbarActionBase } from "../../types/rapid-action-types";

export type RapidToolbarLinkConfig = RapidToolbarActionBase & {
  url: string;
  target?: string;
};

export interface RapidToolbarLinkRockConfig extends SimpleRockConfig, RapidToolbarLinkConfig {}
