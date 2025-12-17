import { ActionHandler, ActionHandlerContext, IPluginActionHandler } from "~/core/actionHandler";
import { generatePasswordHash, validatePassword } from "~/utilities/passwordUtility";
import { interpreteConfigExpressions, interpreteExpression } from "../ExpressionInterpreter";
import { RpdRouteActionConfig } from "~/types";

export const code = "if";

export type IfActionHandlerConfig = {
  condition: string;
  then: RpdRouteActionConfig[];
  otherwise: RpdRouteActionConfig[];
};

export async function handler(_plugin: any, ctx: ActionHandlerContext, options: IfActionHandlerConfig) {
  const { server, input, routerContext: routeContext } = ctx;
  const { response } = routeContext;
  const { condition, then, otherwise } = options;

  const conditionResult = interpreteExpression(condition, ctx.vars);
  const actions: RpdRouteActionConfig[] = conditionResult ? then : otherwise;
  if (!actions || !actions.length) {
    return;
  }
  await server.runActionHandlers(ctx, actions);
}

export default { code, handler } as IPluginActionHandler;
