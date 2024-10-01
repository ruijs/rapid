import { CountEntityOptions, CountEntityResult, RunEntityActionHandlerOptions } from "~/types";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";
import { removeFiltersWithNullValue } from "~/helpers/filterHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "countCollectionEntities";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  await runCollectionEntityActionHandler(ctx, options, code, async (entityManager, input: CountEntityOptions): Promise<CountEntityResult> => {
    input.filters = removeFiltersWithNullValue(input.filters);
    input.routeContext = ctx.routerContext;
    const count = await entityManager.count(input);
    return { count };
  });
}
