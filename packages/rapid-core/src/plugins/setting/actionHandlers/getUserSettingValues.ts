import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import SettingService, { GetUserSettingValuesInput } from "../SettingService";

export interface GetUserSettingValuesOptions {
  groupCode: string;
}

export const code = "getUserSettingValues";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: GetUserSettingValuesOptions) {
  const { server, routerContext: routeContext } = ctx;
  const userId = routeContext.state.userId;
  if (!userId) {
    ctx.status = 401;
    ctx.output = {
      error: {
        message: "You are not signed in.",
      },
    };
    return;
  }

  const input: GetUserSettingValuesInput = ctx.input;

  if (options?.groupCode) {
    input.groupCode = options.groupCode;
  }

  if (!input.groupCode) {
    throw new Error(`Group code is required when getting system setting values.`);
  }

  const settingService = server.getService<SettingService>("settingService");
  const settingValues = await settingService.getUserSettingValues(routeContext, userId, input.groupCode);

  ctx.output = settingValues;
}
