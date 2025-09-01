import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import AuthPlugin from "../AuthPlugin";
import AuthService from "../services/AuthService";

export const code = "getMyProfile";

export async function handler(plugin: AuthPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext } = ctx;

  const userId = routerContext.state.userId;
  if (!userId) {
    ctx.status = 401;
    ctx.output = {
      error: {
        message: "You are not signed in.",
      },
    };
    return;
  }

  const authService = server.getService<AuthService>("authService");
  const user = await authService.getProfileOfUser(userId);

  ctx.output = {
    user,
  };
}
