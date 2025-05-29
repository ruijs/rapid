import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { generatePasswordHash } from "~/utilities/passwordUtility";

export const code = "resetPassword";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext } = ctx;
  const { response } = routerContext;
  const { userId, password } = input;

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

  const passwordHash = await generatePasswordHash(password);

  await userDataAccessor.updateById(user.id, {
    password: passwordHash,
  });

  ctx.output = {};
}
