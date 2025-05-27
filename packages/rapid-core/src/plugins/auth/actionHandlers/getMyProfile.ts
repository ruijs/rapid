import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import AuthPlugin from "../AuthPlugin";

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

  const userEntitySingularCode = plugin.options?.userEntitySingularCode || "oc_user";
  const profilePropertyCodes = plugin.options?.profilePropertyCodes || ["id", "name", "login", "email", "department", "roles", "state", "createdAt"];
  const entityManager = server.getEntityManager(userEntitySingularCode);
  const user = await entityManager.findEntity({
    filters: [
      {
        operator: "eq",
        field: "id",
        value: userId,
      },
    ],
    properties: profilePropertyCodes,
  });

  ctx.output = {
    user,
  };
}
