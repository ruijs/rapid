import bcrypt from "bcrypt";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import AuthPlugin from "../AuthPlugin";

export const code = "changePassword";

export async function handler(plugin: AuthPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext: routeContext } = ctx;
  const { response } = routeContext;
  const { id, oldPassword, newPassword } = input;

  const userId = routeContext.state.userId;
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
  const userDataAccessor = server.getDataAccessor({
    singularCode: userEntitySingularCode,
  });

  const user = await userDataAccessor.findOne(
    {
      filters: [
        {
          operator: "eq",
          field: "id",
          value: userId,
        },
      ],
    },
    routeContext?.getDbTransactionClient(),
  );

  if (!user) {
    throw new Error("User not found.");
  }

  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("旧密码错误。");
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);

  await userDataAccessor.updateById(
    user.id,
    {
      password: passwordHash,
    },
    routeContext?.getDbTransactionClient(),
  );

  ctx.output = {};
}
