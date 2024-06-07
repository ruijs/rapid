/**
 * Route manager plugin
 */

import { RpdApplicationConfig } from "~/types";
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

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    server.registerActionHandler(this, httpProxy);
  }

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    // TODO: Should rebuild routes after route configurations changed.
    // server.registerEventHandler("entity.create", handleEntityEvent.bind(null, server))
    // server.registerEventHandler("entity.update", handleEntityEvent.bind(null, server))
    // server.registerEventHandler("entity.delete", handleEntityEvent.bind(null, server))
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    const logger = server.getLogger();
    try {
      logger.info("Loading meta of routes...");
      const entityManager = server.getEntityManager("route");
      const routes = await entityManager.findEntities({
        orderBy: [{ field: "endpoint" }],
      });
      applicationConfig.routes.push(...routes);
    } catch (error) {
      logger.crit("Failed to load meta of routes.", { error });
    }
  }
}

export default RouteManager;
