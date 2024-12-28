import * as cron from "cron";
import type { RpdApplicationConfig } from "~/types";
import pluginActionHandlers from "./actionHandlers";
import pluginRoutes from "./routes";
import { CronJobConfiguration } from "~/types/cron-job-types";
import {
  IRpdServer,
  RapidPlugin,
  RpdConfigurationItemOptions,
  RpdServerPluginConfigurableTargetOptions,
  RpdServerPluginExtendingAbilities,
} from "~/core/server";
import { ActionHandlerContext } from "~/core/actionHandler";
import { find } from "lodash";
import { validateLicense } from "~/helpers/licenseHelper";

class CronJobPlugin implements RapidPlugin {
  #server: IRpdServer;

  constructor() {}

  get code(): string {
    return "cronJob";
  }

  get description(): string {
    return "";
  }

  get extendingAbilities(): RpdServerPluginExtendingAbilities[] {
    return [];
  }

  get configurableTargets(): RpdServerPluginConfigurableTargetOptions[] {
    return [];
  }

  get configurations(): RpdConfigurationItemOptions[] {
    return [];
  }

  async initPlugin(server: IRpdServer): Promise<any> {
    this.#server = server;
  }

  async registerMiddlewares(server: IRpdServer): Promise<any> {}

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    for (const actionHandler of pluginActionHandlers) {
      server.registerActionHandler(this, actionHandler);
    }
  }

  async registerEventHandlers(server: IRpdServer): Promise<any> {}

  async registerMessageHandlers(server: IRpdServer): Promise<any> {}

  async registerTaskProcessors(server: IRpdServer): Promise<any> {}

  async onLoadingApplication(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureModelProperties(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    const cronJobs = server.listCronJobs();
    for (const job of cronJobs) {
      const jobInstance = cron.CronJob.from({
        ...(job.jobOptions || {}),
        cronTime: job.cronTime,
        onTick: async () => {
          server.getLogger().info(`Executing cron job '${job.code}'...`);
          await this.executeJob(server, job);
        },
      });
      jobInstance.start();
    }
  }

  getJobConfigurationByCode(code: string) {
    return find(this.#server.listCronJobs(), (job) => job.code === code);
  }

  async executeJob(server: IRpdServer, job: CronJobConfiguration) {
    const logger = server.getLogger();
    try {
      validateLicense(server);

      let handlerContext: ActionHandlerContext = {
        logger,
        routerContext: null,
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
    } catch (ex) {
      logger.error('Cron job "%s" execution error: %s', job.code, ex.message, { cronJobCode: job.code });
    }
  }
}

export default CronJobPlugin;
