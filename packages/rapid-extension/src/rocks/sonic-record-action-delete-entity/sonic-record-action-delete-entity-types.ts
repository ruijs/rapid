import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface SonicRecordActionDeleteEntityConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {}

export interface SonicRecordActionDeleteEntityRockConfig extends SimpleRockConfig, SonicRecordActionDeleteEntityConfig {}
