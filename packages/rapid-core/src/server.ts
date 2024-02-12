import * as _ from "lodash";
import DataAccessor from "./dataAccess/dataAccessor";
import {
  GetDataAccessorOptions,
  GetModelOptions,
  IDatabaseAccessor,
  IDatabaseConfig,
  IQueryBuilder,
  IRpdDataAccessor,
  RpdApplicationConfig,
  RpdDataModel,
  RpdServerEventTypes,
  RapidServerConfig,
} from "./types";

import QueryBuilder from "./queryBuilder/queryBuilder";
import PluginManager from "./core/pluginManager";
import EventManager from "./core/eventManager";
import { ActionHandler, IPluginActionHandler } from "./core/actionHandler";
import { IRpdServer, RapidPlugin } from "./core/server";
import { buildRoutes } from "./core/routesBuilder";
import { Next, RouteContext } from "./core/routeContext";
import { RapidRequest } from "./core/request";
import bootstrapApplicationConfig from "./bootstrapApplicationConfig";

export interface InitServerOptions {
  databaseAccessor: IDatabaseAccessor;
  databaseConfig: IDatabaseConfig;
  serverConfig: RapidServerConfig;
  applicationConfig?: RpdApplicationConfig;
  plugins?: RapidPlugin[];
}

export class RapidServer implements IRpdServer {
  #pluginManager: PluginManager;
  #plugins: RapidPlugin[];
  #eventManager: EventManager;
  #middlewares: any[];
  #bootstrapApplicationConfig: RpdApplicationConfig;
  #applicationConfig: RpdApplicationConfig;
  #actionHandlersMapByCode: Map<string, ActionHandler>;
  #databaseAccessor: IDatabaseAccessor;
  queryBuilder: IQueryBuilder;
  config: RapidServerConfig;
  databaseConfig: IDatabaseConfig;
  #buildedRoutes: (ctx: any, next: any) => any;

  constructor(options: InitServerOptions) {
    this.#pluginManager = new PluginManager(this);
    this.#eventManager = new EventManager();
    this.#middlewares = [];
    this.#bootstrapApplicationConfig = options.applicationConfig || bootstrapApplicationConfig;

    this.#applicationConfig = {} as RpdApplicationConfig;
    this.#actionHandlersMapByCode = new Map();
    this.#databaseAccessor = options.databaseAccessor;

    this.queryBuilder = new QueryBuilder({
      dbDefaultSchema: options.databaseConfig.dbDefaultSchema,
    });
    this.databaseConfig = options.databaseConfig;
    this.config = options.serverConfig;

    this.#plugins = options.plugins || [];
  }

  getApplicationConfig() {
    return this.#applicationConfig;
  }

  appendApplicationConfig(config: Partial<RpdApplicationConfig>) {
    const { models, routes } = config;
    if (models) {
      for (const model of models) {
        const originalModel = _.find(this.#applicationConfig.models, (item) => item.singularCode == model.singularCode);
        if (originalModel) {
          originalModel.name = model.name;
          const originalProperties = originalModel.properties;
          for (const property of model.properties) {
            const originalProperty = _.find(originalProperties, (item) => item.code == property.code);
            if (originalProperty) {
              originalProperty.name = property.name;
            } else {
              originalProperties.push(property);
            }
          }
        } else {
          this.#applicationConfig.models.push(model);
        }
      }
    }

    if (routes) {
      for (const route of routes) {
        const originalRoute = _.find(this.#applicationConfig.routes, (item) => item.code == route.code);
        if (originalRoute) {
          originalRoute.name = route.name;
          originalRoute.actions = route.actions;
        } else {
          this.#applicationConfig.routes.push(route);
        }
      }
    }
  }

  registerActionHandler(
    plugin: RapidPlugin,
    options: IPluginActionHandler,
  ) {
    const handler = _.bind(options.handler, null, plugin);
    this.#actionHandlersMapByCode.set(options.code, handler);
  }

  getActionHandlerByCode(code: string) {
    return this.#actionHandlersMapByCode.get(code);
  }

  registerMiddleware(middleware: any) {
    this.#middlewares.push(middleware);
  }

  getDataAccessor<T = any>(
    options: GetDataAccessorOptions,
  ): IRpdDataAccessor<T> {
    const { namespace, singularCode } = options;
    // TODO: Should reuse the and DataAccessor instance
    const model = this.getModel(options);
    if (!model) {
      throw new Error(`Data model ${namespace}.${singularCode} not found.`);
    }

    const dataAccessor = new DataAccessor<T>(this.#databaseAccessor, {
      model,
      queryBuilder: this.queryBuilder as QueryBuilder,
    });
    return dataAccessor;
  }

  getModel(options: GetModelOptions): RpdDataModel | undefined {
    if (options.namespace) {
      return this.#applicationConfig?.models.find((e) => e.namespace === options.namespace && e.singularCode === options.singularCode);
    }

    return this.#applicationConfig?.models.find((e) => e.singularCode === options.singularCode);
  }

  registerEventHandler<K extends keyof RpdServerEventTypes>(
    eventName: K,
    listener: (...args: RpdServerEventTypes[K]) => void,
  ): this {
    this.#eventManager.on(eventName, listener);
    return this;
  }

  async emitEvent<K extends keyof RpdServerEventTypes>(
    eventName: K,
    sender: RapidPlugin,
    payload: RpdServerEventTypes[K][1],
  ) {
    console.log(`Emit event "${eventName}"`, payload);
    await this.#eventManager.emit<K>(eventName, sender, payload as any);

    // TODO: should move this logic into metaManager
    // if (
    //   (eventName === "entity.create" || eventName === "entity.update" ||
    //     eventName === "entity.delete") &&
    //   payload.namespace === "meta"
    // ) {
    //   await this.configureApplication();
    // }
  }

  async start() {
    console.log("Starting rapid server...");
    const pluginManager = this.#pluginManager;
    await pluginManager.loadPlugins(this.#plugins);

    await pluginManager.initPlugins();

    await pluginManager.registerMiddlewares();
    await pluginManager.registerActionHandlers();
    await pluginManager.registerEventHandlers();
    await pluginManager.registerMessageHandlers();
    await pluginManager.registerTaskProcessors();

    await this.configureApplication();

    console.log(`Application ready.`);
    await pluginManager.onApplicationReady(this, this.#applicationConfig);
  }

  async configureApplication() {
    this.#applicationConfig = _.merge(
      {},
      this.#bootstrapApplicationConfig,
    ) as RpdApplicationConfig;

    const pluginManager = this.#pluginManager;
    await pluginManager.onLoadingApplication(this, this.#applicationConfig);
    await pluginManager.configureModels(this, this.#applicationConfig);
    await pluginManager.configureModelProperties(this, this.#applicationConfig);
    await pluginManager.configureRoutes(this, this.#applicationConfig);

    // TODO: check application configuration.

    await pluginManager.onApplicationLoaded(this, this.#applicationConfig);

    this.#buildedRoutes = await buildRoutes(this, this.#applicationConfig);
  }

  async queryDatabaseObject(sql: string, params?: unknown[] | Record<string,unknown>) : Promise<any[]> {
    return await this.#databaseAccessor.queryDatabaseObject(sql, params);
  }

  async tryQueryDatabaseObject(sql: string, params?: unknown[] | Record<string,unknown>) : Promise<any[]> {
    try {
      return await this.queryDatabaseObject(sql, params);
    } catch (err) {
      console.error(err.message);
    }

    return [];
  }

  get middlewares() {
    return this.#middlewares;
  }

  async handleRequest(request: Request, next: Next) {
    const rapidRequest = new RapidRequest(request);
    await rapidRequest.parseBody();
    const routeContext = new RouteContext(rapidRequest);
    await this.#buildedRoutes(routeContext, next);
    return routeContext.response.getResponse();
  }
}
