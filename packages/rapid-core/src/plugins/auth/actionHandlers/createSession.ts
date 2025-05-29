import { setCookie } from "~/deno-std/http/cookie";
import { ActionHandlerContext } from "~/core/actionHandler";
import AuthService from "../services/AuthService";
import { validateLicense } from "~/helpers/licenseHelper";
import AuthPlugin from "../AuthPlugin";
import { validatePassword } from "~/utilities/passwordUtility";

export const code = "createSession";

export async function handler(plugin: AuthPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext: routeContext, logger } = ctx;
  const { response } = routeContext;
  const { account, password } = input;

  validateLicense(server);

  const userEntitySingularCode = plugin.options?.userEntitySingularCode || "oc_user";
  const userDataAccessor = server.getDataAccessor({
    singularCode: userEntitySingularCode,
  });

  const user = await userDataAccessor.findOne(
    {
      filters: [
        {
          operator: "eq",
          field: "login",
          value: account,
        },
        {
          operator: "null",
          field: "deleted_at",
        },
      ],
    },
    routeContext?.getDbTransactionClient(),
  );

  if (!user) {
    throw new Error("用户名或密码错误。");
  }

  if (user.state !== "enabled") {
    throw new Error("用户已被禁用，不允许登录。");
  }

  const isMatch = await validatePassword(password, user.password);
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
