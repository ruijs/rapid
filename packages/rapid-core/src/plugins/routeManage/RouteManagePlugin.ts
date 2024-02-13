/**
 * Route manager plugin
 */

import {
  RpdApplicationConfig,
} from "~/types";
import { RpdServerPluginExtendingAbilities, RpdServerPluginConfigurableTargetOptions, RpdConfigurationItemOptions, IRpdServer, RapidPlugin } from "~/core/server";
import * as httpProxy from "./actionHandlers/httpProxy";


class RouteManager implements RapidPlugin {
  get code(): string {
    return "routeManager";
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

  async initPlugin(server: IRpdServer): Promise<any> {
  }

  async registerMiddlewares(server: IRpdServer): Promise<any> {
  }

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    server.registerActionHandler(this, httpProxy);
  }

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    // TODO: Should rebuild routes after route configurations changed.
    // server.registerEventHandler("entity.create", handleEntityEvent.bind(null, server))
    // server.registerEventHandler("entity.update", handleEntityEvent.bind(null, server))
    // server.registerEventHandler("entity.delete", handleEntityEvent.bind(null, server))
  }

  async registerMessageHandlers(server: IRpdServer): Promise<any> {
  }

  async registerTaskProcessors(server: IRpdServer): Promise<any> {
  }

  async onLoadingApplication(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async configureModelProperties(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    try {
      const entityManager = server.getEntityManager("route");
      const routes = await entityManager.findEntities({
        orderBy: [
          { field: "endpoint" },
        ],
      });
      applicationConfig.routes.push(...routes);
    } catch (ex) {
      console.warn("Failed to loading existing meta of routes.", ex.message);
    }
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    console.log("[routeManager.onApplicationLoaded] onApplicationLoaded");
  }

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }
}

export default RouteManager;
