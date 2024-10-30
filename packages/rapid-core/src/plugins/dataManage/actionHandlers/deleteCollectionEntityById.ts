import { IDatabaseClient, RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "deleteCollectionEntityById";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input, routerContext: routeContext } = ctx;
  logger.debug(`Running ${code} handler...`);

  const entityManager = server.getEntityManager(options.singularCode);

  let transactionDbClient: IDatabaseClient;

  try {
    transactionDbClient = await routeContext.beginDbTransaction();
    await entityManager.deleteById(
      {
        id: input.id,
        routeContext: ctx.routerContext,
      },
      plugin,
    );
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
