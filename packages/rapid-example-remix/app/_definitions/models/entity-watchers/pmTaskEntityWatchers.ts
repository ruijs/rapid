import type { EntityWatcher, EntityWatchHandlerContext } from "@ruiapp/rapid-core";
import { PmTask } from "~/_definitions/meta/entity-types";

export default [
  {
    eventName: "entity.beforeResponse",
    modelSingularCode: "pm_task",
    handler: async (ctx: EntityWatchHandlerContext<"entity.beforeResponse">) => {
      const { server, payload } = ctx;
      const entities: PmTask[] = payload.entities;

      entities.forEach((entity) => {
        entity.permissions = {
          actions: ["task.update", "task.delete"],
        };
      });
    },
  },
] satisfies EntityWatcher<any>[];
