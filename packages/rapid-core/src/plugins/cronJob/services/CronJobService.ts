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
          await this.tryExecuteJob(job);
        },
      });
      jobInstance.start();

      this.#jobInstances.push({
        code: job.code,
        instance: jobInstance,
      });
    }
  }

  async tryExecuteJob(job: CronJobConfiguration) {
    const server = this.#server;
    const logger = server.getLogger();
    logger.info(`Executing cron job '${job.code}'...`);

    let handlerContext: ActionHandlerContext = {
      logger,
      routerContext: RouteContext.newSystemOperationContext(server),
      next: null,
      server,
      applicationConfig: null,
      input: null,
    };

    try {
      await this.executeJob(handlerContext, job);
      logger.info(`Completed cron job '${job.code}'...`);
    } catch (ex: any) {
      logger.error('Cron job "%s" execution error: %s', job.code, ex.message);

      if (job.onError) {
        try {
          await job.onError(handlerContext, ex);
        } catch (ex) {
          logger.error('Error handler of cron job "%s" execution failed: %s', job.code, ex.message);
        }
      }
    }
  }

  /**
   * 执行指定任务
   * @param job
   */
  async executeJob(handlerContext: ActionHandlerContext, job: CronJobConfiguration) {
    const server = this.#server;
    validateLicense(server);

    if (job.actionHandlerCode) {
      const actionHandler = server.getActionHandlerByCode(job.code);
      await actionHandler(handlerContext, job.handleOptions);
    } else {
      await job.handler(handlerContext, job.handleOptions);
    }
  }
}
