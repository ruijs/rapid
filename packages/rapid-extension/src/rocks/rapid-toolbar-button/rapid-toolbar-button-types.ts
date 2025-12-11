import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarActionBase } from "../../types/rapid-action-types";

export interface RapidToolbarButtonConfig extends RapidToolbarActionBase {
  actionType?: "button" | "link";
  url?: string;

  /**
   * @deprecated
   */
  pageCode?: string;
}

export interface RapidToolbarButtonRockConfig extends SimpleRockConfig, RapidToolbarButtonConfig {}
