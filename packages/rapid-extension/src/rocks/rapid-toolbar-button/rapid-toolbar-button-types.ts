import type { RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarActionBase } from "../../types/rapid-action-types";

export const RAPID_TOOLBAR_BUTTON_ROCK_TYPE = "rapidToolbarButton" as const;

export interface RapidToolbarButtonProps extends RapidToolbarActionBase {
  actionType?: "button" | "link";
  url?: string;

  /**
   * @deprecated
   */
  pageCode?: string;

  onAction?: () => Promise<void> | void;
}

export interface RapidToolbarButtonRockConfig extends SimpleRockConfig, Omit<RapidToolbarButtonProps, "onAction"> {
  $type: typeof RAPID_TOOLBAR_BUTTON_ROCK_TYPE;

  onAction?: RockEventHandlerConfig;
}
