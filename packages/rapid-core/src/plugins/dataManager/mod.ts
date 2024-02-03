/**
 * Support manage data in database.
 * This plugin provide:
 * - routes for manage data in database.
 */

import * as _ from "lodash";
import {
  IPluginInstance,
  RpdApplicationConfig,
  RpdHttpMethod,
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
import { RpdServerPluginExtendingAbilities, RpdServerPluginConfigurableTargetOptions, RpdConfigurationItemOptions, IRpdServer } from "~/core/server";

export const code = "dataManager";
export const description = "对数据进行管理，提供增删改查等接口。";
export const extendingAbilities: RpdServerPluginExtendingAbilities[] = [];
export const configurableTargets: RpdServerPluginConfigurableTargetOptions[] = [];
export const configurations: RpdConfigurationItemOptions[] = [];

const routeConfigs: {
  code: string;
  method: RpdHttpMethod;
  endpoint: string;
  handlerCode: string;
}[] = [
  {
    code: "createBatch",
    method: "post",
    endpoint: "/operations/create_batch",
    handlerCode: "createCollectionEntitiesBatch",
  },
  {
    code: "find",
    method: "post",
    endpoint: "/operations/find",
    handlerCode: "findCollectionEntities",
  },
  {
    code: "count",
    method: "post",
    endpoint: "/operations/count",
    handlerCode: "countCollectionEntities",
  },
  {
    code: "addRelations",
    method: "post",
    endpoint: "/operations/add_relations",
    handlerCode: "addEntityRelations",
  },
  {
    code: "removeRelations",
    method: "post",
    endpoint: "/operations/remove_relations",
    handlerCode: "removeEntityRelations",
  },
  {
    code: "getById",
    method: "get",
    endpoint: "/:id",
    handlerCode: "findCollectionEntityById",
  },
  {
    code: "create",
    method: "post",
    endpoint: "",
    handlerCode: "createCollectionEntity",
  },
  {
    code: "updateById",
    method: "post",
    endpoint: "/:id",
    handlerCode: "updateCollectionEntityById",
  },
  {
    code: "deleteById",
    method: "delete",
    endpoint: "/:id",
    handlerCode: "deleteCollectionEntityById",
  },
];

let _plugin: IPluginInstance;

export async function initPlugin(plugin: IPluginInstance, server: IRpdServer) {
  _plugin = plugin;
}

export async function registerHttpHandlers(server: IRpdServer) {
  server.registerHttpHandler(_plugin, findCollectionEntitiesHttpHandler);
  server.registerHttpHandler(_plugin, findCollectionEntityById);
  server.registerHttpHandler(_plugin, countCollectionEntities);
  server.registerHttpHandler(_plugin, createCollectionEntity);
  server.registerHttpHandler(_plugin, createCollectionEntitiesBatch);
  server.registerHttpHandler(_plugin, updateCollectionEntityById);
  server.registerHttpHandler(_plugin, addEntityRelations);
  server.registerHttpHandler(_plugin, removeEntityRelations);
  server.registerHttpHandler(_plugin, deleteCollectionEntityById);
  server.registerHttpHandler(_plugin, queryDatabase);
}

export async function configureRoutes(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  const { routes, models } = applicationConfig;

  models.forEach((model) => {
    const { namespace, singularCode, pluralCode } = model;

    routeConfigs.forEach((routeConfig) => {
      routes.push({
        namespace,
        name: `${namespace}.${singularCode}.${routeConfig.code}`,
        code: `${namespace}.${singularCode}.${routeConfig.code}`,
        type: "RESTful",
        method: routeConfig.method,
        endpoint: `/api/${namespace}/${pluralCode}${routeConfig.endpoint}`,
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
}

export async function onApplicationLoaded(
  server: IRpdServer,
  application: RpdApplicationConfig,
) {
  console.log("[dataManager.onApplicationLoaded]");
}
