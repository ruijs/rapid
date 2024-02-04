import * as _ from "lodash";
import DataAccessor from "./dataAccess/dataAccessor";
import {
  GetDataAccessorOptions,
  GetModelOptions,
  IDatabaseAccessor,
  IDatabaseConfig,
  IPluginInstance,
  IQueryBuilder,
  IRpdDataAccessor,
  RpdApplicationConfig,
  RpdDataModel,
  RpdServerEventTypes,
  RapidServerConfig,
} from "./types";

import QueryBuilder from "./queryBuilder/queryBuilder";
import * as pluginManager from "./core/pluginManager";
import EventManager from "./core/eventManager";
import { HttpRequestHandler, IPluginHttpHandler } from "./core/httpHandler";
import { IRpdServer } from "./core/server";
import { buildRoutes } from "./core/routesBuilder";
import { Next, RouteContext } from "./core/routeContext";
import { RapidRequest } from "./core/request";
import bootstrapApplicationConfig from "./bootstrapApplicationConfig";

export interface InitServerOptions {
  databaseAccessor: IDatabaseAccessor;
  databaseConfig: IDatabaseConfig;
  serverConfig: RapidServerConfig;
  applicationConfig?: RpdApplicationConfig;
}

export class RapidServer implements IRpdServer {
  #eventManager: EventManager;
  #middlewares: any[];
  #bootstrapApplicationConfig: RpdApplicationConfig;
  #applicationConfig: RpdApplicationConfig;
  #httpHandlersMapByCode: Map<string, HttpRequestHandler>;
  #databaseAccessor: IDatabaseAccessor;
  queryBuilder: IQueryBuilder;
  config: RapidServerConfig;
  databaseConfig: IDatabaseConfig;
  #buildedRoutes: (ctx: any, next: any) => any;

  constructor(options: InitServerOptions) {
    this.#eventManager = new EventManager();
    this.#middlewares = [];
    this.#bootstrapApplicationConfig = options.applicationConfig || bootstrapApplicationConfig;

    this.#applicationConfig = {} as RpdApplicationConfig;
    this.#httpHandlersMapByCode = new Map();
    this.#databaseAccessor = options.databaseAccessor;

    this.queryBuilder = new QueryBuilder({
      dbDefaultSchema: options.databaseConfig.dbDefaultSchema,
    });
    this.databaseConfig = options.databaseConfig;
    this.config = options.serverConfig;
  }

  getApplicationConfig() {
    return this.#applicationConfig;
  }

  registerHttpHandler(
    plugin: IPluginInstance,
    options: IPluginHttpHandler,
  ) {
    const handler = _.bind(options.handler, null, plugin);
    this.#httpHandlersMapByCode.set(options.code, handler);
  }

  getHttpHandlerByCode(code: string) {
    return this.#httpHandlersMapByCode.get(code);
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

    const dataAccessor = new DataAccessor<T>({
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
    sender: IPluginInstance,
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
    await pluginManager.loadPlugins();

    await pluginManager.initPlugins(this);

    await pluginManager.registerMiddlewares(this);
    await pluginManager.registerHttpHandlers(this);
    await pluginManager.registerEventHandlers(this);
    await pluginManager.registerMessageHandlers(this);
    await pluginManager.registerTaskProcessors(this);

    await this.configureApplication();

    console.log(`Application ready.`);
    await pluginManager.onApplicationReady(this, this.#applicationConfig);
  }

  async configureApplication() {
    this.#applicationConfig = _.merge(
      {},
      this.#bootstrapApplicationConfig,
    ) as RpdApplicationConfig;

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
    const routeContext = new RouteContext(new RapidRequest(request));
    await this.#buildedRoutes(routeContext, next);
    return routeContext.response.getResponse();
  }
}
