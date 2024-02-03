import { HttpHandlerContext } from "~/core/httpHandler";
import { IPluginInstance } from "~/types";

export const code = "listMetaModels";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: any,
) {
  const { applicationConfig } = ctx;
  ctx.output = { list: applicationConfig.models };
}
