import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicToolbarNewEntityButtonConfig extends Omit<RapidToolbarButtonProps, "actionEventName"> {}

export interface SonicToolbarNewEntityButtonRockConfig extends SimpleRockConfig, SonicToolbarNewEntityButtonConfig {}
