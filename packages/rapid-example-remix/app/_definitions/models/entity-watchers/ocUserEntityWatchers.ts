import type {EntityWatcher, EntityWatchHandlerContext} from "@ruiapp/rapid-core";

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "oc_user",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const {server, payload, routerContext } = ctx;
      server.getLogger().warn("oc_user updated with changes:", payload.changes);
      server.getLogger().warn("routerContext.state:", routerContext?.state);
    },
  },
] satisfies EntityWatcher<any>[];
