import { RockEventHandler, RockEventHandlerConfig } from "@ruiapp/move-style";
import { isArray } from "lodash";

export function strictToRockEventHandlers(config: RockEventHandlerConfig): RockEventHandler[] {
  if (!config) {
    return [];
  }

  if (isArray(config)) {
    return config;
  }

  return [config];
}
