import { IDatabaseClient, RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "createCollectionEntity";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input, routerContext: routeContext } = ctx;

  const { defaultInput, fixedInput } = options;
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const entityManager = server.getEntityManager(options.singularCode);

  let transactionDbClient: IDatabaseClient;

  try {
    transactionDbClient = await routeContext.beginDbTransaction();

    const output = await entityManager.createEntity(
      {
        entity: input,
        routeContext,
      },
      plugin,
    );
    ctx.output = output;

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
