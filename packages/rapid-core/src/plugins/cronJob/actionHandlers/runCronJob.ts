import { ActionHandlerContext } from "~/core/actionHandler";
import { RunCronJobActionHandlerOptions, RunCronJobInput } from "../CronJobPluginTypes";
import type CronJobPlugin from "../CronJobPlugin";
import CronJobService from "../services/CronJobService";

export const code = "runCronJob";

export async function handler(plugin: CronJobPlugin, ctx: ActionHandlerContext, options: RunCronJobActionHandlerOptions) {
  const { server, routerContext: routeContext } = ctx;
  const { response } = routeContext;

  const input: RunCronJobInput = ctx.input;

  if (options?.code) {
    input.code = options.code;
  }

  if (!input.code) {
    throw new Error(`Cron job code is required.`);
  }

  const cronJobService = server.getService<CronJobService>("cronJobService");
  const jobConfig = cronJobService.getJobConfigurationByCode(input.code);
  if (!jobConfig) {
    throw new Error(`Cron job with code '${input.code}' was not found.`);
  }

  // running job in background.
  cronJobService.executeJob(jobConfig, input.input);

  response.json({});
}
