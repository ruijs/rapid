/**
 * Notification plugin
 */

import { RpdApplicationConfig } from "~/types";
import {
  IRpdServer,
  RapidPlugin,
  RpdConfigurationItemOptions,
  RpdServerPluginConfigurableTargetOptions,
  RpdServerPluginExtendingAbilities,
} from "~/core/server";

import pluginActionHandlers from "./actionHandlers";
import pluginModels from "./models";
import pluginRoutes from "./routes";
import NotificationService from "./NotificationService";

class SequencePlugin implements RapidPlugin {
  #notificationService!: NotificationService;

  get notificationService() {
    return this.#notificationService;
  }

  get code(): string {
    return "notification";
  }

  get description(): string {
    return null;
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

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    for (const actionHandler of pluginActionHandlers) {
      server.registerActionHandler(this, actionHandler);
    }
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#notificationService = new NotificationService(server);
    server.registerService("notificationService", this.#notificationService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig) {}
}

export default SequencePlugin;
