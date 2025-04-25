import { RunMockHandlerOptions } from "~/types";
import { doProxy } from "~/proxy/mod";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "mock";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunMockHandlerOptions) {
  const { logger, routerContext } = ctx;
  const { response } = routerContext;

  const { responseTime, responseStatus, responseHeaders, responseBody } = options;

  if (responseTime) {
    await waitMilliseconds(responseTime);
  }

  for (const [key, value] of Object.entries(responseHeaders)) {
    response.headers.set(key, value as string);
  }

  response.status = responseStatus || 200;
  response.body = responseBody || "";
}

function waitMilliseconds(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
