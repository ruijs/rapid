import { RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";

export const code = "findCollectionEntityById";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  await runCollectionEntityActionHandler(ctx, options, code, true, true, async (entityManager, input: any): Promise<any> => {
    const { routerContext: routeContext } = ctx;
    const { id } = input;
    const entity = await entityManager.findById({
      id,
      routeContext,
    });
    if (!entity) {
      ctx.routerContext.response.json(
        {
          error: {
            message: `${options.namespace}.${options.singularCode} with id "${id}" was not found.`,
          },
        },
        404,
      );
      // routerContext.json() function will not be called if the ctx.output is null or undefined.
      return;
    }
    return entity;
  });
}
