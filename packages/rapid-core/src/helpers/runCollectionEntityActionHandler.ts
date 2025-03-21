import { IDatabaseClient, RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "./inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import EntityManager from "~/dataAccess/entityManager";

type EntityActionHandler = (entityManager: EntityManager, input: any) => Promise<any>;

export default async function runCollectionEntityActionHandler(
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
  code: string,
  autoMergeInput: boolean,
  runInTransaction: boolean,
  handleEntityAction: EntityActionHandler,
) {
  const { logger, server, input, routerContext: routeContext } = ctx;

  const { defaultInput, fixedInput } = options;
  let mergedInput: any;
  if (autoMergeInput) {
    mergedInput = mergeInput(defaultInput, input, fixedInput);
  }
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const entityManager = server.getEntityManager(options.singularCode);

  if (runInTransaction) {
    let transactionDbClient: IDatabaseClient;

    try {
      transactionDbClient = await routeContext.initDbTransactionClient();
      await routeContext.beginDbTransaction();

      const result = handleEntityAction(entityManager, autoMergeInput ? mergedInput : input);
      if (result instanceof Promise) {
        ctx.output = await result;
      } else {
        ctx.output = result;
      }

      await routeContext.commitDbTransaction();
    } catch (ex) {
      await routeContext.rollbackDbTransaction();
      throw ex;
    } finally {
      if (transactionDbClient) {
        transactionDbClient.release();
      }
    }
  } else {
    const result = handleEntityAction(entityManager, mergedInput);
    if (result instanceof Promise) {
      ctx.output = await result;
    } else {
      ctx.output = result;
    }
  }
}
