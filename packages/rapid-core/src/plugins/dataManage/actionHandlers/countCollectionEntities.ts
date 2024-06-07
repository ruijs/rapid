import { RunEntityActionHandlerOptions } from "~/types";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";
import { removeFiltersWithNullValue } from "~/dataAccess/filterHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "countCollectionEntities";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  await runCollectionEntityActionHandler(ctx, options, code, (entityManager, input) => {
    input.filters = removeFiltersWithNullValue(input.filters);
    return entityManager.count(input);
  });
}
