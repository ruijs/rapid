import { FindEntityOptions, RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export interface DeleteCollectionEntitiesInput {
  filters: FindEntityOptions["filters"];
}

export const code = "deleteCollectionEntities";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, routerContext } = ctx;
  const input: DeleteCollectionEntitiesInput = ctx.input;
  logger.debug(`Running ${code} handler...`);

  if (!input.filters || !input.filters.length) {
    throw new Error("Filters are required when deleting entities.");
  }

  const entityManager = server.getEntityManager(options.singularCode);
  const entities = await entityManager.findEntities({
    routeContext: routerContext,
    filters: input.filters,
  });

  for (const entity of entities) {
    await entityManager.deleteById(
      {
        routeContext: ctx.routerContext,
        id: entity.id,
      },
      plugin,
    );
  }

  ctx.status = 200;
  ctx.output = {};
}
