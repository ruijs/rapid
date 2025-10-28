import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import SettingService, { SetSystemSettingValuesInput } from "../SettingService";

export interface SetSystemSettingValuesOptions {
  groupCode: string;
}

export const code = "setSystemSettingValues";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: SetSystemSettingValuesOptions) {
  const { server, routerContext: routeContext } = ctx;
  const { response } = routeContext;

  const input: SetSystemSettingValuesInput = ctx.input;

  if (options?.groupCode) {
    input.groupCode = options.groupCode;
  }

  if (!input.groupCode) {
    throw new Error(`Group code is required when setting system setting values.`);
  }

  const settingService = server.getService<SettingService>("settingService");

  await settingService.setSystemSettingValues(routeContext, input.groupCode, input.values);

  ctx.output = {};
}
