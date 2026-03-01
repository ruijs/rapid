import type { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidRecordActionBase } from "~/types/rapid-action-types";

export const SONIC_RECORD_ACTION_DELETE_ENTITY_ROCK_TYPE = "sonicRecordActionDeleteEntity" as const;

export interface SonicRecordActionDeleteEntityProps extends Omit<RapidRecordActionBase, "actionEventName"> {}

export interface SonicRecordActionDeleteEntityRockConfig extends SimpleRockConfig, SonicRecordActionDeleteEntityProps {
  $type: typeof SONIC_RECORD_ACTION_DELETE_ENTITY_ROCK_TYPE;
}
