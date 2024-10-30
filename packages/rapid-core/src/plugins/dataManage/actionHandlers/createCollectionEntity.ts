import { RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";

export const code = "createCollectionEntity";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  await runCollectionEntityActionHandler(ctx, options, code, true, true, async (entityManager, input: any): Promise<any> => {
    const { routerContext: routeContext } = ctx;
    const output = await entityManager.createEntity(
      {
        entity: input,
        routeContext,
      },
      plugin,
    );
    return output;
  });
}
