import { HttpHandlerContext } from "~/core/httpHandler";
import { setCookie } from "~/deno-std/http/cookie";
import { IPluginInstance } from "~/types";

export const code = "deleteSession";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: any,
) {
  const { server, input, routerContext } = ctx;
  const { response } = routerContext;

  setCookie(response.headers, {
    name: ctx.server.config.sessionCookieName,
    value: "",
    path: "/",
  });

  routerContext.redirect("/signin");
}
