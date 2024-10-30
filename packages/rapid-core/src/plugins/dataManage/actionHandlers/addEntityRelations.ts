import { AddEntityRelationsOptions, RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";

export const code = "addEntityRelations";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  await runCollectionEntityActionHandler(ctx, options, code, true, true, async (entityManager, input: AddEntityRelationsOptions): Promise<any> => {
    const { routerContext: routeContext } = ctx;
    input.routeContext = routeContext;
    await entityManager.addRelations(input, plugin);
    return {};
  });
}
