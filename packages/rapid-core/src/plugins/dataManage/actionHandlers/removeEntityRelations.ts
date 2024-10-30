import { IDatabaseClient, RemoveEntityRelationsOptions, RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "removeEntityRelations";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input, routerContext: routeContext } = ctx;
  const { defaultInput, fixedInput } = options;

  const mergedInput: RemoveEntityRelationsOptions = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });
  mergedInput.routeContext = ctx.routerContext;

  const entityManager = server.getEntityManager(options.singularCode);

  let transactionDbClient: IDatabaseClient;

  try {
    transactionDbClient = await routeContext.beginDbTransaction();

    await entityManager.removeRelations(mergedInput, plugin);
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
