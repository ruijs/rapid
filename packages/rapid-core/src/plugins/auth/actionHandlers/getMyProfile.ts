import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "getMyProfile";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: any,
) {
  const { server, input, routerContext } = ctx;

  const userId = routerContext.state.userId;
  if (!userId) {
    ctx.status = 401;
    ctx.output = {
      error: {
        message: "You are not signed in."
      }
    }
    return;
  }

  const entityManager = server.getEntityManager("oc_user");
  const user = await entityManager.findEntity({
    filters: [
      {
        operator: "eq",
        field: "id",
        value: userId,
      }
    ],
    properties: ["id", "name", "login", "email", "department", "roles", "state", "createdAt"],
  });

  ctx.output = {
    user,
  };
}
