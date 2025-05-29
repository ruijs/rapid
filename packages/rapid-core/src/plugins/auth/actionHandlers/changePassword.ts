import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { generatePasswordHash, validatePassword } from "~/utilities/passwordUtility";

export const code = "changePassword";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext } = ctx;
  const { response } = routerContext;
  const { id, oldPassword, newPassword } = input;

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

  const userDataAccessor = server.getDataAccessor({
    singularCode: "oc_user",
  });

  const user = await userDataAccessor.findOne({
    filters: [
      {
        operator: "eq",
        field: "id",
        value: userId,
      },
    ],
  });

  if (!user) {
    throw new Error("User not found.");
  }

  const isMatch = await validatePassword(oldPassword, user.password);
  if (!isMatch) {
    throw new Error("旧密码错误。");
  }

  const passwordHash = await generatePasswordHash(newPassword);

  await userDataAccessor.updateById(user.id, {
    password: passwordHash,
  });

  ctx.output = {};
}
