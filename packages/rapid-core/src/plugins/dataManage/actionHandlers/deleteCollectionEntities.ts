import { FindEntityOptions, IDatabaseClient, RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export interface DeleteCollectionEntitiesInput {
  filters: FindEntityOptions["filters"];
  noTransaction?: boolean;
}

export const code = "deleteCollectionEntities";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, routerContext: routeContext } = ctx;
  const input: DeleteCollectionEntitiesInput = ctx.input;
  const { filters, noTransaction } = input;
  logger.debug(`Running ${code} handler...`);

  if (!filters || !filters.length) {
    throw new Error("Filters are required when deleting entities.");
  }

  const entityManager = server.getEntityManager(options.singularCode);
  const entities = await entityManager.findEntities({
    routeContext: routeContext,
    filters,
  });

  if (noTransaction) {
    for (const entity of entities) {
      await entityManager.deleteById(
        {
          routeContext,
          id: entity.id,
        },
        plugin,
      );
    }
    ctx.status = 200;
    ctx.output = {};
  } else {
    let transactionDbClient: IDatabaseClient;

    try {
      transactionDbClient = await routeContext.beginDbTransaction();

      for (const entity of entities) {
        await entityManager.deleteById(
          {
            routeContext,
            id: entity.id,
          },
          plugin,
        );
      }
      ctx.status = 200;
      ctx.output = {};

      await routeContext.commitDbTransaction();
    } catch (ex) {
      await routeContext.rollbackDbTransaction();
      throw ex;
    } finally {
      if (transactionDbClient) {
        transactionDbClient.release();
      }
    }
  }
}
