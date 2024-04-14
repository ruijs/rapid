import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicToolbarRefreshButtonConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
};

export interface SonicToolbarRefreshButtonRockConfig extends SimpleRockConfig, SonicToolbarRefreshButtonConfig {
}