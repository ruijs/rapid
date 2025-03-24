import type { EntityWatcher, EntityWatchHandlerContext } from "~/types";
import CronJobService from "../services/CronJobService";
import { SysCronJob } from "../CronJobPluginTypes";

export default [
  {
    eventName: "entity.update",
    modelSingularCode: "sys_cron_job",
    handler: async (ctx: EntityWatchHandlerContext<"entity.update">) => {
      const { server, payload } = ctx;

      const cronJobService = server.getService<CronJobService>("cronJobService");

      const changes: Partial<SysCronJob> = payload.changes;
      const after: SysCronJob = payload.after;
      cronJobService.updateJobConfig({
        code: after.code,
        cronTime: changes.cronTime,
        disabled: changes.disabled,
        jobOptions: changes.jobOptions,
      });
    },
  },
] satisfies EntityWatcher<any>[];
