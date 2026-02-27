import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicToolbarRefreshButtonConfig extends Omit<RapidToolbarButtonProps, "actionEventName"> {}

export interface SonicToolbarRefreshButtonRockConfig extends SimpleRockConfig, SonicToolbarRefreshButtonConfig {}
