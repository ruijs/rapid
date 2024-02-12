import { HttpHandlerContext } from "~/core/httpHandler";
import { RapidPlugin } from "~/core/server";
import { setCookie } from "~/deno-std/http/cookie";

export const code = "deleteSession";

export async function handler(
  plugin: RapidPlugin,
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
