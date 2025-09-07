import { CronJob } from "cron";
import { IRpdServer } from "~/core/server";
import { find, isNil, isString, Many } from "lodash";
import { RouteContext } from "~/core/routeContext";
import { validateLicense } from "~/helpers/licenseHelper";
import { JobRunningResult, NamedCronJobInstance, SysCronJob, UpdateJobConfigOptions } from "../CronJobPluginTypes";
import { CronJobConfiguration } from "~/types/cron-job-types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { formatDateTimeWithTimezone, getNowStringWithTimezone } from "~/utilities/timeUtility";
import { executeInRouteContext } from "~/helpers/dbTransactionHelper";

export default class CronJobService {
  #server: IRpdServer;
  #namedJobInstances: NamedCronJobInstance[];

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

  #createJobInstance(job: CronJobConfiguration) {
    return CronJob.from({
      ...(job.jobOptions || {}),
      cronTime: job.cronTime,
      onTick: async () => {
        await this.executeJob(job);
      },
    });
  }

  async #startJobInstance(routeContext: RouteContext, jobConfiguration: CronJobConfiguration, jobInstance: CronJob) {
    const server = this.#server;
    const jobCode = jobConfiguration.code;
    const cronJobManager = server.getEntityManager<SysCronJob>("sys_cron_job");
    const cronJobInDb = await cronJobManager.findEntity({
      routeContext,
      filters: [{ operator: "eq", field: "code", value: jobCode }],
    });

    if (cronJobInDb) {
      let nextRunningTime: string | null;
      nextRunningTime = formatDateTimeWithTimezone(jobInstance.nextDate().toISO());

      await cronJobManager.updateEntityById({
        routeContext,
        id: cronJobInDb.id,
        entityToSave: {
          nextRunningTime,
        } as Partial<SysCronJob>,
      });
    }

    jobInstance.start();
  }

  async #setJobNextRunningTime(routeContext: RouteContext, jobCode: string, nextRunningTime: string | null) {
    const server = this.#server;
    const cronJobManager = server.getEntityManager<SysCronJob>("sys_cron_job");
    const cronJobInDb = await cronJobManager.findEntity({
      routeContext,
      filters: [{ operator: "eq", field: "code", value: jobCode }],
    });
    await cronJobManager.updateEntityById({
      routeContext,
      id: cronJobInDb.id,
      entityToSave: {
        nextRunningTime,
      } as Partial<SysCronJob>,
    });
  }

  /**
   * 重新加载定时任务
   */
  async reloadJobs() {
    const server = this.#server;
    const routeContext = RouteContext.newSystemOperationContext(server);

    if (this.#namedJobInstances) {
      for (const job of this.#namedJobInstances) {
        job.instance.stop();
      }
    }

    this.#namedJobInstances = [];

    const cronJobManager = server.getEntityManager<SysCronJob>("sys_cron_job");
    const cronJobConfigurationsInDb = await cronJobManager.findEntities({ routeContext });

    const cronJobConfigurations = server.listCronJobs();
    for (const cronJobConfig of cronJobConfigurations) {
      const jobCode = cronJobConfig.code;
      const jobConfigInDb = find(cronJobConfigurationsInDb, { code: jobCode });
      if (jobConfigInDb) {
        overrideJobConfig(cronJobConfig, jobConfigInDb);
      }

      if (cronJobConfig.disabled) {
        await this.#setJobNextRunningTime(routeContext, jobCode, null);
        continue;
      }

      const jobInstance = this.#createJobInstance(cronJobConfig);
      await this.#startJobInstance(routeContext, cronJobConfig, jobInstance);

      this.#namedJobInstances.push({
        code: jobCode,
        instance: jobInstance,
      });
    }
  }

  /**
   * 执行指定任务
   * @param job
   * @param input
   */
  async executeJob(job: CronJobConfiguration, input?: any) {
    const server = this.#server;
    const logger = server.getLogger();

    const jobCode = job.code;
    logger.info(`Executing cron job '${jobCode}'...`);

    let handlerContext: ActionHandlerContext = {
      logger,
      routerContext: RouteContext.newSystemOperationContext(server),
      next: null,
      server,
      applicationConfig: null,
      input,
    };

    let result: JobRunningResult;
    let lastErrorMessage: string | null;
    let lastErrorStack: string | null;
    try {
      validateLicense(server);

      await executeInRouteContext(handlerContext.routerContext, job.executeInDbTransaction, async () => {
        if (job.actionHandlerCode) {
          const actionHandler = server.getActionHandlerByCode(job.code);
          await actionHandler(handlerContext, job.handleOptions);
        } else {
          await job.handler(handlerContext, job.handleOptions);
        }
      });

      result = "success";
      logger.info(`Completed cron job '${jobCode}'...`);
    } catch (ex: any) {
      logger.error('Cron job "%s" execution error: %s', jobCode, ex.message);
      if (isString(ex)) {
        lastErrorMessage = ex;
      } else {
        lastErrorMessage = ex.message;
        lastErrorStack = ex.stack;
      }
      result = "failed";

      if (job.onError) {
        try {
          await job.onError(handlerContext, ex);
        } catch (ex) {
          logger.error('Error handler of cron job "%s" execution failed: %s', jobCode, ex.message);
        }
      }
    }

    try {
      const cronJobManager = server.getEntityManager<SysCronJob>("sys_cron_job");
      const cronJobInDb = await cronJobManager.findEntity({
        filters: [{ operator: "eq", field: "code", value: jobCode }],
      });

      if (cronJobInDb) {
        let nextRunningTime: string | null;
        const namedJobInstance = find(this.#namedJobInstances, { code: jobCode });
        if (namedJobInstance && namedJobInstance.instance) {
          nextRunningTime = formatDateTimeWithTimezone(namedJobInstance.instance.nextDate().toISO());
        }

        await cronJobManager.updateEntityById({
          id: cronJobInDb.id,
          entityToSave: {
            nextRunningTime,
            lastRunningResult: result,
            lastRunningTime: getNowStringWithTimezone(),
            lastErrorMessage,
            lastErrorStack,
          } as Partial<SysCronJob>,
        });
      }
    } catch (ex: any) {
      logger.error("Failed to saving cron job running result. job code: %s, error: %s", jobCode, ex.message);
    }
  }

  async updateJobConfig(routeContext: RouteContext, options: UpdateJobConfigOptions) {
    const server = this.#server;
    const cronJobs = server.listCronJobs();
    const jobCode = options.code;
    if (!jobCode) {
      throw new Error(`options.code is required.`);
    }

    const cronJobConfig = find(cronJobs, { code: jobCode });
    if (!cronJobConfig) {
      throw new Error(`Cron job with code "${jobCode}" not found.`);
    }

    if (!(["cronTime", "disabled", "jobOptions"] as (keyof typeof options)[]).some((field) => !isNil(options[field]))) {
      return;
    }

    overrideJobConfig(cronJobConfig, options);

    const namedJobInstance = find(this.#namedJobInstances, { code: jobCode });
    if (namedJobInstance && namedJobInstance.instance) {
      namedJobInstance.instance.stop();
      namedJobInstance.instance = null;
    }

    if (cronJobConfig.disabled) {
      await this.#setJobNextRunningTime(routeContext, jobCode, null);
    } else {
      const jobInstance = this.#createJobInstance(cronJobConfig);
      await this.#startJobInstance(routeContext, cronJobConfig, jobInstance);

      if (namedJobInstance) {
        namedJobInstance.instance = jobInstance;
      } else {
        this.#namedJobInstances.push({
          code: cronJobConfig.code,
          instance: jobInstance,
        });
      }
    }
  }
}

function overrideJobConfig(original: Partial<SysCronJob> | CronJobConfiguration, overrides: Partial<SysCronJob>) {
  (["cronTime", "disabled", "jobOptions"] as (keyof typeof overrides)[]).forEach((field: string) => {
    if (!isNil(overrides[field])) {
      original[field] = overrides[field];
    }
  });
}
