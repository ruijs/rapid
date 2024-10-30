import { AddEntityRelationsOptions, IDatabaseClient, RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "addEntityRelations";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input, routerContext: routeContext } = ctx;

  const { defaultInput, fixedInput } = options;
  const mergedInput: AddEntityRelationsOptions = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const entityManager = server.getEntityManager(options.singularCode);
  mergedInput.routeContext = ctx.routerContext;

  let transactionDbClient: IDatabaseClient;

  try {
    transactionDbClient = await routeContext.beginDbTransaction();

    await entityManager.addRelations(mergedInput, plugin);
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
