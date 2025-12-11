import type { SimpleRockConfig } from "@ruiapp/move-style";
import type { RapidToolbarActionBase } from "../../types/rapid-action-types";

export type RapidToolbarPageLinkConfig = RapidToolbarActionBase & {
  pageCode: string;
};

export interface RapidToolbarPageLinkRockConfig extends SimpleRockConfig, RapidToolbarPageLinkConfig {}
