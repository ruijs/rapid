import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicRecordActionUpdateEntityConfig extends Omit<RapidToolbarButtonProps, "actionEventName"> {
  entity?: Record<string, any>;
}

export interface SonicRecordActionUpdateEntityRockConfig extends SimpleRockConfig, SonicRecordActionUpdateEntityConfig {}
