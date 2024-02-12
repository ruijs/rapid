/**
 * File manager plugin
 */

import {
  RpdApplicationConfig,
} from "~/types";

import * as downloadDocumentHttpHandler from "./httpHandlers/downloadDocument";
import * as downloadFileHttpHandler from "./httpHandlers/downloadFile";
import * as uploadFileHttpHandler from "./httpHandlers/uploadFile";
import { IRpdServer, RapidPlugin, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";


class FileManager implements RapidPlugin {
  get code(): string {
    return "fileManager";
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

  async registerHttpHandlers(server: IRpdServer): Promise<any> {
    server.registerHttpHandler(this, downloadDocumentHttpHandler);
    server.registerHttpHandler(this, downloadFileHttpHandler);
    server.registerHttpHandler(this, uploadFileHttpHandler);
  }

  async registerEventHandlers(server: IRpdServer): Promise<any> {
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
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    console.log("fileManager.onApplicationLoaded");
  }

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }
}

export default FileManager;
