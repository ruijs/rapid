import { FindEntityOptions, RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";

export interface DeleteCollectionEntitiesInput {
  filters: FindEntityOptions["filters"];
  noTransaction?: boolean;
}

export const code = "deleteCollectionEntities";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { input } = ctx;
  const { noTransaction } = input;
  await runCollectionEntityActionHandler(
    ctx,
    options,
    code,
    true,
    !noTransaction,
    async (entityManager, input: DeleteCollectionEntitiesInput): Promise<any> => {
      const { routerContext: routeContext } = ctx;
      const { filters } = input;
      if (!filters || !filters.length) {
        throw new Error("Filters are required when deleting entities.");
      }

      const entities = await entityManager.findEntities({
        routeContext: routeContext,
        filters,
      });
      for (const entity of entities) {
        await entityManager.deleteById(
          {
            routeContext,
            id: entity.id,
          },
          plugin,
        );
      }
      return {};
    },
  );
}
