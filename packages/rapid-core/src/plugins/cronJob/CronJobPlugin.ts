import type { RpdApplicationConfig } from "~/types";
import pluginModels from "./models";
import pluginActionHandlers from "./actionHandlers";
import pluginRoutes from "./routes";
import pluginEntityWatchers from "./entityWatchers";
import {
  IRpdServer,
  RapidPlugin,
  RpdConfigurationItemOptions,
  RpdServerPluginConfigurableTargetOptions,
  RpdServerPluginExtendingAbilities,
} from "~/core/server";
import CronJobService from "./services/CronJobService";
import { SysCronJob } from "./CronJobPluginTypes";
import { pick } from "lodash";

class CronJobPlugin implements RapidPlugin {
  #server: IRpdServer;
  #cronJobService!: CronJobService;

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

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    for (const entityWatcher of pluginEntityWatchers) server.registerEntityWatcher(entityWatcher);
  }
  async registerMessageHandlers(server: IRpdServer): Promise<any> {}

  async registerTaskProcessors(server: IRpdServer): Promise<any> {}

  async onLoadingApplication(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureModelProperties(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#cronJobService = new CronJobService(server);
    server.registerService("cronJobService", this.#cronJobService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    await saveCronJobsToDatabase(server);
  }

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    await this.#cronJobService.reloadJobs();
  }
}

export default CronJobPlugin;

async function saveCronJobsToDatabase(server: IRpdServer) {
  const cronJobManager = server.getEntityManager<SysCronJob>("sys_cron_job");

  for (const cronJobToSave of server.listCronJobs()) {
    const currentCronJob = await cronJobManager.findEntity({
      filters: [{ operator: "eq", field: "code", value: cronJobToSave.code }],
    });

    if (!currentCronJob) {
      await cronJobManager.createEntity({
        entity: pick(cronJobToSave, ["code", "description", "cronTime", "disabled"]),
      });
    }
  }
}
