import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "listMetaRoutes";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server } = ctx;
  const applicationConfig = server.getApplicationConfig();
  ctx.output = { list: applicationConfig.routes };
}
