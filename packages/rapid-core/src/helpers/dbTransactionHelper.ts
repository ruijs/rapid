import { RouteContext } from "~/core/routeContext";
import { IDatabaseClient } from "~/types";

/**
 * 在事务中执行`func`
 * @param routeContext
 * @param func
 * @returns
 */
export async function executeInDbTransaction<TResult>(routeContext: RouteContext, func: () => Promise<TResult>): Promise<TResult> {
  if (!routeContext) {
    throw new Error(`Patameter "routeContext" is required if you want run in transaction.`);
  }
  let transactionDbClient: IDatabaseClient | undefined;

  try {
    transactionDbClient = await routeContext.initDbTransactionClient();
    await routeContext.beginDbTransaction();
    const result = await func();
    await routeContext.commitDbTransaction();
    return result;
  } catch (ex) {
    await routeContext.rollbackDbTransaction();
    throw ex;
  } finally {
    if (transactionDbClient) {
      transactionDbClient.release();
    }
  }
}

export async function executeInRouteContext<TResult>(
  routeContext: RouteContext,
  inDbTransaction: boolean | undefined | null,
  func: () => Promise<TResult>,
): Promise<TResult> {
  if (inDbTransaction) {
    return await executeInDbTransaction(routeContext, func);
  } else {
    return await func();
  }
}
