import { RunProxyHandlerOptions } from "~/types";
import { doProxy } from "~/proxy/mod";
import { HttpHandlerContext } from "~/core/httpHandler";
import { RapidPlugin } from "~/core/server";

export const code = "httpProxy";

export async function handler(
  plugin: RapidPlugin,
  ctx: HttpHandlerContext,
  options: RunProxyHandlerOptions,
) {
  console.debug(`Running ${code} handler...`);

  await doProxy(ctx.routerContext, options);
}
