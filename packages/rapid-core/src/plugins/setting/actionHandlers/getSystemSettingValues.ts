import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import SettingService, { GetSystemSettingValuesInput } from "../SettingService";

export interface GetSystemSettingValuesOptions {
  groupCode: string;
}

export const code = "getSystemSettingValues";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: GetSystemSettingValuesOptions) {
  const { server, routerContext } = ctx;
  const { response } = routerContext;

  const input: GetSystemSettingValuesInput = ctx.input;

  if (options?.groupCode) {
    input.groupCode = options.groupCode;
  }

  if (!input.groupCode) {
    throw new Error(`Group code is required when getting system setting values.`);
  }

  const settingService = server.getService<SettingService>("settingService");

  const settingValues = await settingService.getSystemSettingValues(input.groupCode);

  ctx.output = settingValues;
}
