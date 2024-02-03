import { IPluginInstance, RunProxyHandlerOptions } from "~/types";
import { doProxy } from "~/proxy/mod";
import { HttpHandlerContext } from "~/core/httpHandler";

export const code = "httpProxy";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: RunProxyHandlerOptions,
) {
  console.debug(`Running ${code} handler...`);

  await doProxy(ctx.routerContext, options);
}
