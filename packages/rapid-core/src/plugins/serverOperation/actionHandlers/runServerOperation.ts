import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { executeInDbTransaction, executeInRouteContext } from "~/helpers/dbTransactionHelper";

export const code = "runServerOperation";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: {
    operation: (ctx: ActionHandlerContext) => Promise<void>;
    executeInDbTransaction?: boolean;
  },
) {
  const { operation } = options;

  await executeInRouteContext(ctx.routerContext, options.executeInDbTransaction, async () => {
    await operation(ctx);
  });
}
