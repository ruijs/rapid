/**
 * Meta manager plugin
 */

import * as _ from "lodash";
import {
  IPluginInstance,
  RpdApplicationConfig,
} from "~/types";
import { IRpdServer, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";

import pluginHttpHandlers from "./httpHandlers";
import pluginModels from "./models";
import pluginRoutes from "./routes";

export const code = "authManager";
export const description = "authManager";
export const extendingAbilities: RpdServerPluginExtendingAbilities[] = [];
export const configurableTargets: RpdServerPluginConfigurableTargetOptions[] = [];
export const configurations: RpdConfigurationItemOptions[] = [];

let _plugin: IPluginInstance;

export async function initPlugin(plugin: IPluginInstance, server: IRpdServer) {
  _plugin = plugin;
}

export async function registerHttpHandlers(server: IRpdServer) {
  for (const httpHandler of pluginHttpHandlers) {
    server.registerHttpHandler(_plugin, httpHandler);
  }
}

export async function registerEventHandlers(server: IRpdServer) {
}

export async function configureModels(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  applicationConfig.models.push(...pluginModels);
}

export async function configureRoutes(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  applicationConfig.routes.push(...pluginRoutes);
}

export async function onApplicationLoaded(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  console.log("authManager.onApplicationLoaded");
}
