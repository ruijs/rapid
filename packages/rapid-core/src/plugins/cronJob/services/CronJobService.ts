import { CronJob } from "cron";
import { IRpdServer } from "~/core/server";
import { find } from "lodash";
import { RouteContext } from "~/core/routeContext";
import { validateLicense } from "~/helpers/licenseHelper";
import { NamedCronJobInstance } from "../CronJobPluginTypes";
import { CronJobConfiguration } from "~/types/cron-job-types";
import { ActionHandlerContext } from "~/core/actionHandler";

export default class CronJobService {
  #server: IRpdServer;
  #jobInstances: NamedCronJobInstance[];

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  /**
   * 根据编号获取定时任务配置信息
   * @param code
   * @returns
   */
  getJobConfigurationByCode(code: string) {
    return find(this.#server.listCronJobs(), (job) => job.code === code);
  }

  /**
   * 重新加载定时任务
   */
  reloadJobs() {
    const server = this.#server;

    if (this.#jobInstances) {
      for (const job of this.#jobInstances) {
        job.instance.stop();
      }
    }

    this.#jobInstances = [];

    const cronJobs = server.listCronJobs();
    for (const job of cronJobs) {
      if (job.disabled) {
        continue;
      }

      const jobInstance = CronJob.from({
        ...(job.jobOptions || {}),
        cronTime: job.cronTime,
        onTick: async () => {
          await this.tryExecuteJob(server, job);
        },
      });
      jobInstance.start();

      this.#jobInstances.push({
        code: job.code,
        instance: jobInstance,
      });
    }
  }

  async tryExecuteJob(server: IRpdServer, job: CronJobConfiguration) {
    const logger = server.getLogger();
    logger.info(`Executing cron job '${job.code}'...`);

    try {
      await this.executeJob(job);
      logger.info(`Completed cron job '${job.code}'...`);
    } catch (ex: any) {
      logger.error('Cron job "%s" execution error: %s', job.code, ex.message, { cronJobCode: job.code });
    }
  }

  /**
   * 执行指定任务
   * @param job
   */
  async executeJob(job: CronJobConfiguration) {
    const server = this.#server;
    const logger = server.getLogger();
    validateLicense(server);

    let handlerContext: ActionHandlerContext = {
      logger,
      routerContext: RouteContext.newSystemOperationContext(server),
      next: null,
      server,
      applicationConfig: null,
      input: null,
    };

    if (job.actionHandlerCode) {
      const actionHandler = server.getActionHandlerByCode(job.code);
      await actionHandler(handlerContext, job.handleOptions);
    } else {
      await job.handler(handlerContext, job.handleOptions);
    }
  }
}
