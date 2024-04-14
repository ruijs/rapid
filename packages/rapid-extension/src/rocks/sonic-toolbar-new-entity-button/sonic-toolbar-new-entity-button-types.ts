import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicToolbarNewEntityButtonConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
};

export interface SonicToolbarNewEntityButtonRockConfig extends SimpleRockConfig, SonicToolbarNewEntityButtonConfig {
}