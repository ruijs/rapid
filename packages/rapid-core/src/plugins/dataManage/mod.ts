/**
 * Support manage data in database.
 * This plugin provide:
 * - routes for manage data in database.
 */

import * as _ from "lodash";
import {
  RpdApplicationConfig,
  RpdHttpMethod,
  RpdRoute,
  RunEntityHttpHandlerOptions,
} from "~/types";

import * as findCollectionEntitiesHttpHandler from "./httpHandlers/findCollectionEntities";
import * as findCollectionEntityById from "./httpHandlers/findCollectionEntityById";
import * as countCollectionEntities from "./httpHandlers/countCollectionEntities";
import * as createCollectionEntity from "./httpHandlers/createCollectionEntity";
import * as createCollectionEntitiesBatch from "./httpHandlers/createCollectionEntitiesBatch";
import * as updateCollectionEntityById from "./httpHandlers/updateCollectionEntityById";
import * as deleteCollectionEntityById from "./httpHandlers/deleteCollectionEntityById";
import * as addEntityRelations from "./httpHandlers/addEntityRelations";
import * as removeEntityRelations from "./httpHandlers/removeEntityRelations";
import * as queryDatabase from "./httpHandlers/queryDatabase";
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

  async registerHttpHandlers(server: IRpdServer): Promise<any> {
    server.registerHttpHandler(this, findCollectionEntitiesHttpHandler);
    server.registerHttpHandler(this, findCollectionEntityById);
    server.registerHttpHandler(this, countCollectionEntities);
    server.registerHttpHandler(this, createCollectionEntity);
    server.registerHttpHandler(this, createCollectionEntitiesBatch);
    server.registerHttpHandler(this, updateCollectionEntityById);
    server.registerHttpHandler(this, addEntityRelations);
    server.registerHttpHandler(this, removeEntityRelations);
    server.registerHttpHandler(this, deleteCollectionEntityById);
    server.registerHttpHandler(this, queryDatabase);
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
          handlers: [
            {
              code: routeConfig.handlerCode,
              config: {
                namespace,
                singularCode,
              } as RunEntityHttpHandlerOptions,
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