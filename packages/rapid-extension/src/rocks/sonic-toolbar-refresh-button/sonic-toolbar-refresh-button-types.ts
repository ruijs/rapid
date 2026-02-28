import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export const SONIC_TOOLBAR_REFRESH_BUTTON_ROCK_TYPE = "sonicToolbarRefreshButton" as const;

export interface SonicToolbarRefreshButtonProps extends Omit<RapidToolbarButtonProps, "actionEventName" | "onAction"> {}

export interface SonicToolbarRefreshButtonRockConfig extends SimpleRockConfig, SonicToolbarRefreshButtonProps {
  $type: typeof SONIC_TOOLBAR_REFRESH_BUTTON_ROCK_TYPE;
}
