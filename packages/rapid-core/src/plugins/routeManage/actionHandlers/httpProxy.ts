import { RunProxyHandlerOptions } from "~/types";
import { doProxy } from "~/proxy/mod";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "httpProxy";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunProxyHandlerOptions) {
  const { logger } = ctx;
  logger.debug(`Running ${code} handler...`);

  await doProxy(ctx.routerContext, options);
}
