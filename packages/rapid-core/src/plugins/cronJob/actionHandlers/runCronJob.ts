import { ActionHandlerContext } from "~/core/actionHandler";
import { RunCronJobActionHandlerOptions, RunCronJobInput } from "../CronJobPluginTypes";
import type CronJobPlugin from "../CronJobPlugin";

export const code = "runCronJob";

export async function handler(
  plugin: CronJobPlugin,
  ctx: ActionHandlerContext,
  options: RunCronJobActionHandlerOptions,
) {
  const { server, routerContext } = ctx;
  const { response } = routerContext;
  
  const input: RunCronJobInput = ctx.input;

  if (options.code) {
    input.code = options.code;
  }

  if (!input.code) {
    throw new Error(`Cron job code is required.`);
  }

  const job = plugin.getJobConfigurationByCode(input.code);
  if (!job) {
    throw new Error(`Cron job with code '${input.code}' was not found.`);
  }

  await plugin.executeJob(server, job);

  response.json({
  });
}
