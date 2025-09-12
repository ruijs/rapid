import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "listMetaModels";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server } = ctx;
  const applicationConfig = server.getApplicationConfig();
  ctx.output = { list: applicationConfig.models };
}
