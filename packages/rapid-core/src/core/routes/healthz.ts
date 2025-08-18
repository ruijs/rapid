import { RpdRoute } from "~/types";
import { ActionHandlerContext } from "../actionHandler";

export default {
  namespace: "sys",
  name: "sys.healthz",
  code: "sys.healthz",
  type: "RESTful",
  method: "GET",
  endpoint: "/healthz",
  handler,
} satisfies RpdRoute;

export async function handler(ctx: ActionHandlerContext) {
  const { server, input, routerContext: routeContext, logger } = ctx;
  const { response } = routeContext;
  const {} = input;

  ctx.output = {};
}
