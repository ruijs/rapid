/**
 * Support manage data in database.
 * This plugin provide:
 * - routes for manage data in database.
 */

import {
  RpdApplicationConfig,
  RpdHttpMethod,
  RpdRoute,
  RunEntityActionHandlerOptions,
} from "~/types";

import * as findCollectionEntities from "./actionHandlers/findCollectionEntities";
import * as findCollectionEntityById from "./actionHandlers/findCollectionEntityById";
import * as countCollectionEntities from "./actionHandlers/countCollectionEntities";
import * as createCollectionEntity from "./actionHandlers/createCollectionEntity";
import * as createCollectionEntitiesBatch from "./actionHandlers/createCollectionEntitiesBatch";
import * as updateCollectionEntityById from "./actionHandlers/updateCollectionEntityById";
import * as deleteCollectionEntityById from "./actionHandlers/deleteCollectionEntityById";
import * as addEntityRelations from "./actionHandlers/addEntityRelations";
import * as removeEntityRelations from "./actionHandlers/removeEntityRelations";
import * as queryDatabase from "./actionHandlers/queryDatabase";
import { RpdServerPluginExtendingAbilities, RpdServerPluginConfigurableTargetOptions, RpdConfigurationItemOptions, IRpdServer, RapidPlugin } from "~/core/server";


const routeConfigs: {
  code: string;
  method: RpdHttpMethod;
  endpoint: string;
  handlerCode: string;
}[] = [
  {
    code: "createBatch",
    method: "POST",
    endpoint: "/operations/create_batch",
    handlerCode: "createCollectionEntitiesBatch",
  },
  {
    code: "find",
    method: "POST",
    endpoint: "/operations/find",
    handlerCode: "findCollectionEntities",
  },
  {
    code: "count",
    method: "POST",
    endpoint: "/operations/count",
    handlerCode: "countCollectionEntities",
  },
  {
    code: "addRelations",
    method: "POST",
    endpoint: "/operations/add_relations",
    handlerCode: "addEntityRelations",
  },
  {
    code: "removeRelations",
    method: "POST",
    endpoint: "/operations/remove_relations",
    handlerCode: "removeEntityRelations",
  },
  {
    code: "getById",
    method: "GET",
    endpoint: "/:id",
    handlerCode: "findCollectionEntityById",
  },
  {
    code: "create",
    method: "POST",
    endpoint: "",
    handlerCode: "createCollectionEntity",
  },
  {
    code: "updateById",
    method: "PATCH",
    endpoint: "/:id",
    handlerCode: "updateCollectionEntityById",
  },
  {
    code: "deleteById",
    method: "DELETE",
    endpoint: "/:id",
    handlerCode: "deleteCollectionEntityById",
  },
];

class DataManager implements RapidPlugin {
  get code(): string {
    return "dataManager";
  }

  get description(): string {
    return "对数据进行管理，提供增删改查等接口。";
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
    server.registerActionHandler(this, findCollectionEntities);
    server.registerActionHandler(this, findCollectionEntityById);
    server.registerActionHandler(this, countCollectionEntities);
    server.registerActionHandler(this, createCollectionEntity);
    server.registerActionHandler(this, createCollectionEntitiesBatch);
    server.registerActionHandler(this, updateCollectionEntityById);
    server.registerActionHandler(this, addEntityRelations);
    server.registerActionHandler(this, removeEntityRelations);
    server.registerActionHandler(this, deleteCollectionEntityById);
    server.registerActionHandler(this, queryDatabase);
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
    const { models } = applicationConfig;
    const routes: RpdRoute[] = [];
  
    models.forEach((model) => {
      const { namespace, singularCode, pluralCode } = model;
  
      routeConfigs.forEach((routeConfig) => {
        routes.push({
          namespace,
          name: `${namespace}.${singularCode}.${routeConfig.code}`,
          code: `${namespace}.${singularCode}.${routeConfig.code}`,
          type: "RESTful",
          method: routeConfig.method,
          endpoint: `/${namespace}/${pluralCode}${routeConfig.endpoint}`,
          actions: [
            {
              code: routeConfig.handlerCode,
              config: {
                namespace,
                singularCode,
              } as RunEntityActionHandlerOptions,
            },
          ],
        });
      });
    });
  
    server.appendApplicationConfig({ routes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    console.log("[dataManager.onApplicationLoaded]");
  }

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }
}

export default DataManager;