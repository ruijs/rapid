import type { RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export const RAPID_TOOLBAR_UPDATE_ENTITY_BUTTON_ROCK_TYPE = "rapidToolbarUpdateEntityButton" as const;

export interface RapidToolbarUpdateEntityButtonProps extends RapidToolbarButtonProps {
  entity?: Record<string, any>;
  entityId?: number;
  entityCode?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: RockEventHandlerConfig;
  onError?: RockEventHandlerConfig;
}

export interface RapidToolbarUpdateEntityButtonRockConfig extends SimpleRockConfig, RapidToolbarUpdateEntityButtonProps {
  $type: typeof RAPID_TOOLBAR_UPDATE_ENTITY_BUTTON_ROCK_TYPE;
}
