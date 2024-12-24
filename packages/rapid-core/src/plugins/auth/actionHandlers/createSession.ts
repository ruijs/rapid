import bcrypt from "bcrypt";
import { setCookie } from "~/deno-std/http/cookie";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import AuthService from "../services/AuthService";
import { validateLicense } from "~/helpers/licenseHelper";

export const code = "createSession";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext: routeContext, logger } = ctx;
  const { response } = routeContext;
  const { account, password } = input;

  validateLicense(server);

  const userDataAccessor = server.getDataAccessor({
    singularCode: "oc_user",
  });

  const user = await userDataAccessor.findOne(
    {
      filters: [
        {
          operator: "eq",
          field: "login",
          value: account,
        },
      ],
    },
    routeContext?.getDbTransactionClient(),
  );

  if (!user) {
    throw new Error("用户名或密码错误。");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("用户名或密码错误。");
  }

  const authService = server.getService<AuthService>("authService");
  const token = authService.createUserAccessToken({
    issuer: "authManager",
    userId: user.id,
    userLogin: user.login,
  });

  setCookie(response.headers, {
    name: ctx.server.config.sessionCookieName,
    value: token,
    path: "/",
  });

  ctx.output = {
    token,
  };
}
