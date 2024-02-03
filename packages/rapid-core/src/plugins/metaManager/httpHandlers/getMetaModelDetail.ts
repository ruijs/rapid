import { HttpHandlerContext } from "~/core/httpHandler";
import { IPluginInstance } from "~/types";

export const code = "getMetaModelDetail";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: any,
) {
  const { server, input } = ctx;
  const model = server.getModel(input);
  ctx.output = model;
}
