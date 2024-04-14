import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicRecordActionEditEntityConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
};

export interface SonicRecordActionEditEntityRockConfig extends SimpleRockConfig, SonicRecordActionEditEntityConfig {
}