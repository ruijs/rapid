import type { SimpleRockConfig } from "@ruiapp/move-style";
import type { RapidRecordActionBase } from "../../types/rapid-action-types";

export interface RapidTableActionConfig extends RapidRecordActionBase {}

export interface RapidTableActionRockConfig extends SimpleRockConfig, RapidTableActionConfig {}
