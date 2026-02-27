import type { RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface RapidToolbarUpdateEntityButtonConfig extends RapidToolbarButtonProps {
  actionType?: "button";
  entity?: Record<string, any>;
  entityId?: number;
  entityCode?: string;
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: RockEventHandlerConfig;
  onError?: RockEventHandlerConfig;
}

export interface RapidToolbarUpdateEntityButtonRockConfig extends SimpleRockConfig, RapidToolbarUpdateEntityButtonConfig {}
