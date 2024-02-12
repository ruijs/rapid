import { HttpHandlerContext } from "~/core/httpHandler";
import { RapidPlugin } from "~/core/server";

export const code = "getMetaModelDetail";

export async function handler(
  plugin: RapidPlugin,
  ctx: HttpHandlerContext,
  options: any,
) {
  const { server, input } = ctx;
  const model = server.getModel(input);
  ctx.output = model;
}
