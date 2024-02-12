import { HttpHandlerContext } from "~/core/httpHandler";
import { RapidPlugin } from "~/core/server";

export const code = "listMetaModels";

export async function handler(
  plugin: RapidPlugin,
  ctx: HttpHandlerContext,
  options: any,
) {
  const { applicationConfig } = ctx;
  ctx.output = { list: applicationConfig.models };
}
