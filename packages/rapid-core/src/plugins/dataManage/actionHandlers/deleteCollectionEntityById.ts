import { RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";

export const code = "deleteCollectionEntityById";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  await runCollectionEntityActionHandler(ctx, options, code, true, true, async (entityManager, input: any): Promise<any> => {
    const { routerContext: routeContext } = ctx;
    await entityManager.deleteById(
      {
        id: input.id,
        routeContext,
      },
      plugin,
    );
    return {};
  });
}
