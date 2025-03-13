import type { RpdApplicationConfig } from "~/types";
import pluginActionHandlers from "./actionHandlers";
import pluginRoutes from "./routes";
import {
  IRpdServer,
  RapidPlugin,
  RpdConfigurationItemOptions,
  RpdServerPluginConfigurableTargetOptions,
  RpdServerPluginExtendingAbilities,
} from "~/core/server";
import CronJobService from "./services/CronJobService";

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

  async registerEventHandlers(server: IRpdServer): Promise<any> {}

  async registerMessageHandlers(server: IRpdServer): Promise<any> {}

  async registerTaskProcessors(server: IRpdServer): Promise<any> {}

  async onLoadingApplication(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureModelProperties(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#cronJobService = new CronJobService(server);
    server.registerService("cronJobService", this.#cronJobService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#cronJobService.reloadJobs();
  }
}

export default CronJobPlugin;
