/**
 * License plugin
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
import LicenseService from "./LicenseService";
import { LicensePluginInitOptions } from "./LicensePluginTypes";

class LicensePlugin implements RapidPlugin {
  #licenseService!: LicenseService;
  #encryptionKey: string;

  constructor(options: LicensePluginInitOptions) {
    if (!options.encryptionKey) {
      throw new Error(`"encryptionKey" must be provided.`);
    }
    this.#encryptionKey = options.encryptionKey;
  }

  get licenseService() {
    return this.#licenseService;
  }

  get code(): string {
    return "license";
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
    this.#licenseService = new LicenseService(server, this.#encryptionKey);
    server.registerService("licenseService", this.#licenseService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig) {
    await this.#licenseService.loadLicense();
  }
}

export default LicensePlugin;
