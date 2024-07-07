/**
 * Setting plugin
 */

import { CreateEntityOptions, RpdApplicationConfig, RpdDataModel, RpdDataModelProperty } from "~/types";
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
import { isEqual } from "lodash";
import SettingService from "./SettingService";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { getEntityPropertiesIncludingBase } from "~/helpers/metaHelper";

class SettingPlugin implements RapidPlugin {
  #settingService!: SettingService;

  get settingService() {
    return this.#settingService;
  }

  get code(): string {
    return "settingPlugin";
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
    this.#settingService = new SettingService(server);
    server.registerService("settingService", this.#settingService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig) {}
}

export default SettingPlugin;
