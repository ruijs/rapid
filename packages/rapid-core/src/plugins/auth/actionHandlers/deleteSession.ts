import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { setCookie } from "~/deno-std/http/cookie";

export const code = "deleteSession";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext } = ctx;
  const { response } = routerContext;

  setCookie(response.headers, {
    name: ctx.server.config.sessionCookieName,
    value: "",
    path: "/",
  });

  routerContext.redirect("/signin");
}
