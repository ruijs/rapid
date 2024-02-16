/**
 * File manager plugin
 */

import {
  RpdApplicationConfig,
} from "~/types";

import * as downloadDocumentActionHandler from "./actionHandlers/downloadDocument";
import * as downloadFileActionHandler from "./actionHandlers/downloadFile";
import * as uploadFileActionHandler from "./actionHandlers/uploadFile";
import { IRpdServer, RapidPlugin, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";

import pluginRoutes from "./routes";

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

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    server.registerActionHandler(this, downloadDocumentActionHandler);
    server.registerActionHandler(this, downloadFileActionHandler);
    server.registerActionHandler(this, uploadFileActionHandler);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }
}

export default FileManager;
