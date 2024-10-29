import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicRecordActionUpdateEntityConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
  entity?: Record<string, any>;
}

export interface SonicRecordActionUpdateEntityRockConfig extends SimpleRockConfig, SonicRecordActionUpdateEntityConfig {}
