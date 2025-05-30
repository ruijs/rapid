import { ActionHandlerContext } from "~/core/actionHandler";
import AuthPlugin from "../AuthPlugin";
import { generatePasswordHash } from "~/utilities/passwordUtility";

export const code = "resetPassword";

export async function handler(plugin: AuthPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input, routerContext: routeContext } = ctx;
  const { response } = routeContext;
  const { userId, password } = input;

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

  const passwordHash = await generatePasswordHash(password);

  await userDataAccessor.updateById(
    user.id,
    {
      password: passwordHash,
    },
    routeContext?.getDbTransactionClient(),
  );

  ctx.output = {};
}
