import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicRecordActionDeleteEntityConfig extends Omit<RapidToolbarButtonProps, "actionEventName"> {}

export interface SonicRecordActionDeleteEntityRockConfig extends SimpleRockConfig, SonicRecordActionDeleteEntityConfig {}
