import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "getMetaModelDetail";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, input } = ctx;
  const model = server.getModel(input);
  ctx.output = model;
}
