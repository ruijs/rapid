import type { RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export const SONIC_TOOLBAR_NEW_ENTITY_BUTTON_ROCK_TYPE = "sonicToolbarNewEntityButton" as const;

export interface SonicToolbarNewEntityButtonProps extends Omit<RapidToolbarButtonProps, "onAction"> {
  onAction?: () => void;
}

export interface SonicToolbarNewEntityButtonRockConfig extends SimpleRockConfig, Omit<SonicToolbarNewEntityButtonProps, "onAction"> {
  $type: typeof SONIC_TOOLBAR_NEW_ENTITY_BUTTON_ROCK_TYPE;
  onAction?: RockEventHandlerConfig;
}
