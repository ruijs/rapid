/**
 * Route manager plugin
 */

import {
  IPluginInstance,
  RpdApplicationConfig,
} from "~/types";
import { RpdServerPluginExtendingAbilities, RpdServerPluginConfigurableTargetOptions, RpdConfigurationItemOptions, IRpdServer } from "~/core/server";
import { findEntities } from "../../dataAccess/entityManager";
import * as httpProxy from "./httpHandlers/httpProxy";
import * as listMetaRoutes from "./httpHandlers/listMetaRoutes";
import { buildRoutes } from "~/core/routesBuilder";

export const code = "routeManager";
export const description = "routeManager";
export const extendingAbilities: RpdServerPluginExtendingAbilities[] = [];
export const configurableTargets: RpdServerPluginConfigurableTargetOptions[] = [];
export const configurations: RpdConfigurationItemOptions[] = [];

let _plugin: IPluginInstance;

export async function initPlugin(plugin: IPluginInstance, server: IRpdServer) {
  _plugin = plugin;
}

let routes: any;

async function routeHandler(ctx: any, next: any) {
  if (routes) {
    await routes(ctx, next);
  } else {
    await next();
  }
}

export async function registerMiddlewares(server: IRpdServer) {
  // server.registerMiddleware(routeHandler);
}

// export async function registerEventHandlers(server: IRpdServer) {
//   server.registerEventHandler("entity.create", handleEntityEvent.bind(null, server))
//   server.registerEventHandler("entity.update", handleEntityEvent.bind(null, server))
//   server.registerEventHandler("entity.delete", handleEntityEvent.bind(null, server))
// }

// async function handleEntityEvent(server: IRpdServer, sender: IPluginInstance, payload: RpdEntityCreateEventPayload | RpdEntityUpdateEventPayload | RpdEntityDeleteEventPayload) {
//   if (sender === _plugin) {
//     return;
//   }

//   if (payload.namespace === "meta" && payload.modelSingularCode === "route") {
//     console.debug("Rebuilding routes...");
//     routesRef.value = await buildRoutes(server, server.getApplicationConfig());
//   }
// }

export async function registerHttpHandlers(server: IRpdServer) {
  server.registerHttpHandler(_plugin, httpProxy);
  server.registerHttpHandler(_plugin, listMetaRoutes);
}

export async function configureRoutes(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  try {
    const routes = await listRoutes(server, applicationConfig);
    applicationConfig.routes.push(...routes);
  } catch (ex) {
    console.warn("Failed to loading existing meta of routes.", ex.message);
  }
}

function listRoutes(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  const dataAccessor = server.getDataAccessor({
    namespace: "meta",
    singularCode: "route",
  });

  return findEntities(server, dataAccessor, {
    orderBy: [
      { field: "endpoint" },
    ],
  });
}

export async function onApplicationLoaded(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  console.log("[routeManager.onApplicationLoaded] build routes");
  routes = await buildRoutes(server, applicationConfig);
}
