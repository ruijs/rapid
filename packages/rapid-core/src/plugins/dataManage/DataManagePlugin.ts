/**
 * Support manage data in database.
 * This plugin provide:
 * - routes for manage data in database.
 */

import { RpdApplicationConfig, RpdHttpMethod, RpdRoute, RunEntityActionHandlerOptions } from "~/types";

import * as findCollectionEntities from "./actionHandlers/findCollectionEntities";
import * as findCollectionEntityById from "./actionHandlers/findCollectionEntityById";
import * as countCollectionEntities from "./actionHandlers/countCollectionEntities";
import * as createCollectionEntity from "./actionHandlers/createCollectionEntity";
import * as createCollectionEntitiesBatch from "./actionHandlers/createCollectionEntitiesBatch";
import * as updateCollectionEntityById from "./actionHandlers/updateCollectionEntityById";
import * as deleteCollectionEntities from "./actionHandlers/deleteCollectionEntities";
import * as deleteCollectionEntityById from "./actionHandlers/deleteCollectionEntityById";
import * as addEntityRelations from "./actionHandlers/addEntityRelations";
import * as removeEntityRelations from "./actionHandlers/removeEntityRelations";
import * as saveEntity from "./actionHandlers/saveEntity";
import * as queryDatabase from "./actionHandlers/queryDatabase";
import {
  RpdServerPluginExtendingAbilities,
  RpdServerPluginConfigurableTargetOptions,
  RpdConfigurationItemOptions,
  IRpdServer,
  RapidPlugin,
} from "~/core/server";

const entityOperationConfigs: {
  operationCode: string;
  httpMethod: RpdHttpMethod;
  requestEndpoint: string;
  actionHandlerCode: string;
}[] = [
  {
    operationCode: "createBatch",
    httpMethod: "POST",
    requestEndpoint: "/operations/create_batch",
    actionHandlerCode: "createCollectionEntitiesBatch",
  },
  {
    operationCode: "find",
    httpMethod: "POST",
    requestEndpoint: "/operations/find",
    actionHandlerCode: "findCollectionEntities",
  },
  {
    operationCode: "count",
    httpMethod: "POST",
    requestEndpoint: "/operations/count",
    actionHandlerCode: "countCollectionEntities",
  },
  {
    operationCode: "delete",
    httpMethod: "POST",
    requestEndpoint: "/operations/delete",
    actionHandlerCode: "deleteCollectionEntities",
  },
  {
    operationCode: "addRelations",
    httpMethod: "POST",
    requestEndpoint: "/operations/add_relations",
    actionHandlerCode: "addEntityRelations",
  },
  {
    operationCode: "removeRelations",
    httpMethod: "POST",
    requestEndpoint: "/operations/remove_relations",
    actionHandlerCode: "removeEntityRelations",
  },
  {
    operationCode: "getById",
    httpMethod: "GET",
    requestEndpoint: "/:id",
    actionHandlerCode: "findCollectionEntityById",
  },
  {
    operationCode: "create",
    httpMethod: "POST",
    requestEndpoint: "",
    actionHandlerCode: "createCollectionEntity",
  },
  {
    operationCode: "updateById",
    httpMethod: "PATCH",
    requestEndpoint: "/:id",
    actionHandlerCode: "updateCollectionEntityById",
  },
  {
    operationCode: "deleteById",
    httpMethod: "DELETE",
    requestEndpoint: "/:id",
    actionHandlerCode: "deleteCollectionEntityById",
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

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    server.registerActionHandler(this, findCollectionEntities);
    server.registerActionHandler(this, findCollectionEntityById);
    server.registerActionHandler(this, countCollectionEntities);
    server.registerActionHandler(this, createCollectionEntity);
    server.registerActionHandler(this, createCollectionEntitiesBatch);
    server.registerActionHandler(this, updateCollectionEntityById);
    server.registerActionHandler(this, addEntityRelations);
    server.registerActionHandler(this, removeEntityRelations);
    server.registerActionHandler(this, deleteCollectionEntities);
    server.registerActionHandler(this, deleteCollectionEntityById);
    server.registerActionHandler(this, saveEntity);
    server.registerActionHandler(this, queryDatabase);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    const { models } = applicationConfig;
    const routes: RpdRoute[] = [];

    models.forEach((model) => {
      const { namespace, singularCode, pluralCode } = model;

      entityOperationConfigs.forEach((entityOperationConfig) => {
        routes.push({
          namespace,
          name: `${namespace}.${singularCode}.${entityOperationConfig.operationCode}`,
          code: `${namespace}.${singularCode}.${entityOperationConfig.operationCode}`,
          type: "RESTful",
          method: entityOperationConfig.httpMethod,
          endpoint: `/${namespace}/${pluralCode}${entityOperationConfig.requestEndpoint}`,
          actions: [
            {
              code: entityOperationConfig.actionHandlerCode,
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
}

export default DataManager;
