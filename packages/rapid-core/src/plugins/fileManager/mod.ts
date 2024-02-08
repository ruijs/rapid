/**
 * File manager plugin
 */

import * as _ from "lodash";
import {
  IPluginInstance,
  RpdApplicationConfig,
} from "~/types";

import * as downloadDocumentHttpHandler from "./httpHandlers/downloadDocument";
import * as downloadFileHttpHandler from "./httpHandlers/downloadFile";
import * as uploadFileHttpHandler from "./httpHandlers/uploadFile";
import { IRpdServer, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";

export const code = "fileManager";
export const description = "fileManager";
export const extendingAbilities: RpdServerPluginExtendingAbilities[] = [];
export const configurableTargets: RpdServerPluginConfigurableTargetOptions[] = [];
export const configurations: RpdConfigurationItemOptions[] = [];

let _plugin: IPluginInstance;

export async function initPlugin(plugin: IPluginInstance, server: IRpdServer) {
  _plugin = plugin;
}

export async function registerHttpHandlers(server: IRpdServer) {
  server.registerHttpHandler(_plugin, downloadDocumentHttpHandler);
  server.registerHttpHandler(_plugin, downloadFileHttpHandler);
  server.registerHttpHandler(_plugin, uploadFileHttpHandler);
}

export async function registerEventHandlers(server: IRpdServer) {
}

export async function configureModels(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
}

export async function onApplicationLoaded(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  console.log("fileManager.onApplicationLoaded");
}
