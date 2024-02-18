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
  RpdDataModelProperty,
} from "./types";

import QueryBuilder from "./queryBuilder/queryBuilder";
import PluginManager from "./core/pluginManager";
import EventManager from "./core/eventManager";
import { ActionHandler, ActionHandlerContext, IPluginActionHandler } from "./core/actionHandler";
import { IRpdServer, RapidPlugin } from "./core/server";
import { buildRoutes } from "./core/routesBuilder";
import { Next, RouteContext } from "./core/routeContext";
import { RapidRequest } from "./core/request";
import bootstrapApplicationConfig from "./bootstrapApplicationConfig";
import EntityManager from "./dataAccess/entityManager";
import { bind, cloneDeep, find, merge, omit } from "lodash";
import { Logger } from "./facilities/log/LogFacility";

export interface InitServerOptions {
  logger: Logger;
  databaseAccessor: IDatabaseAccessor;
  databaseConfig: IDatabaseConfig;
  serverConfig: RapidServerConfig;
  applicationConfig?: RpdApplicationConfig;
  plugins?: RapidPlugin[];
}

export class RapidServer implements IRpdServer {
  #logger: Logger;
  #pluginManager: PluginManager;
  #plugins: RapidPlugin[];
  #eventManager: EventManager<RpdServerEventTypes>;
  #middlewares: any[];
  #bootstrapApplicationConfig: RpdApplicationConfig;
  #applicationConfig: RpdApplicationConfig;
  #actionHandlersMapByCode: Map<string, ActionHandler>;
  #databaseAccessor: IDatabaseAccessor;
  #cachedDataAccessors: Map<string, DataAccessor>;
  #cachedEntityManager: Map<string, EntityManager>;
  queryBuilder: IQueryBuilder;
  config: RapidServerConfig;
  databaseConfig: IDatabaseConfig;
  #buildedRoutes: (ctx: any, next: any) => any;

  constructor(options: InitServerOptions) {
    this.#logger = options.logger;

    this.#pluginManager = new PluginManager(this);
    this.#eventManager = new EventManager();
    this.#middlewares = [];
    this.#bootstrapApplicationConfig = options.applicationConfig || bootstrapApplicationConfig;

    this.#applicationConfig = {} as RpdApplicationConfig;
    this.#actionHandlersMapByCode = new Map();
    this.#databaseAccessor = options.databaseAccessor;
    this.#cachedDataAccessors = new Map();
    this.#cachedEntityManager = new Map();

    this.queryBuilder = new QueryBuilder({
      dbDefaultSchema: options.databaseConfig.dbDefaultSchema,
    });
    this.databaseConfig = options.databaseConfig;
    this.config = options.serverConfig;

    this.#plugins = options.plugins || [];
  }

  getLogger(): Logger {
    return this.#logger;
  }

  getApplicationConfig() {
    return this.#applicationConfig;
  }

  appendApplicationConfig(config: Partial<RpdApplicationConfig>) {
    const { models, routes } = config;
    if (models) {
      for (const model of models) {
        const originalModel = find(this.#applicationConfig.models, (item) => item.singularCode == model.singularCode);
        if (originalModel) {
          merge(originalModel, omit(model, ["id", "maintainedBy", "namespace", "singularCode", "pluralCode", "schema", "tableName", "properties", "extensions"]));
          originalModel.name = model.name;
          const originalProperties = originalModel.properties;
          for (const property of model.properties) {
            const originalProperty = find(originalProperties, (item) => item.code == property.code);
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
        const originalRoute = find(this.#applicationConfig.routes, (item) => item.code == route.code);
        if (originalRoute) {
          originalRoute.name = route.name;
          originalRoute.actions = route.actions;
        } else {
          this.#applicationConfig.routes.push(route);
        }
      }
    }
  }

  appendModelProperties(modelSingularCode: string, properties: RpdDataModelProperty[]) {
    const originalModel = find(this.#applicationConfig.models, (item) => item.singularCode == modelSingularCode);
    if (!originalModel) {
      throw new Error(`Cannot append model properties. Model '${modelSingularCode}' was not found.`);
    }

    const originalProperties = originalModel.properties;
    for (const property of properties) {
      const originalProperty = find(originalProperties, (item) => item.code == property.code);
      if (originalProperty) {
        originalProperty.name = property.name;
      } else {
        originalProperties.push(property);
      }
    }
  }

  registerActionHandler(
    plugin: RapidPlugin,
    options: IPluginActionHandler,
  ) {
    const handler = bind(options.handler, null, plugin);
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

    let dataAccessor = this.#cachedDataAccessors.get(singularCode);
    if (dataAccessor) {
      return dataAccessor;
    }

    const model = this.getModel(options);
    if (!model) {
      throw new Error(`Data model ${namespace}.${singularCode} not found.`);
    }

    dataAccessor = new DataAccessor<T>(this, this.#databaseAccessor, {
      model,
      queryBuilder: this.queryBuilder as QueryBuilder,
    });
    this.#cachedDataAccessors.set(singularCode, dataAccessor);
    return dataAccessor;
  }

  getModel(options: GetModelOptions): RpdDataModel | undefined {
    if (options.namespace) {
      return this.#applicationConfig?.models.find((e) => e.namespace === options.namespace && e.singularCode === options.singularCode);
    }

    return this.#applicationConfig?.models.find((e) => e.singularCode === options.singularCode);
  }

  getEntityManager<TEntity = any>(singularCode: string): EntityManager<TEntity> {
    let entityManager = this.#cachedEntityManager.get(singularCode);
    if (entityManager) {
      return entityManager;
    }

    const dataAccessor = this.getDataAccessor({ singularCode });
    entityManager = new EntityManager(this, dataAccessor);
    this.#cachedEntityManager.set(singularCode, entityManager);
    return entityManager;
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
    this.#logger.debug(`Emitting '${eventName}' event.`, { eventName, payload });
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
    this.#logger.info("Starting rapid server...");
    const pluginManager = this.#pluginManager;
    await pluginManager.loadPlugins(this.#plugins);

    await pluginManager.initPlugins();

    await pluginManager.registerMiddlewares();
    await pluginManager.registerActionHandlers();
    await pluginManager.registerEventHandlers();
    await pluginManager.registerMessageHandlers();
    await pluginManager.registerTaskProcessors();

    await this.configureApplication();

    this.#logger.info(`Rapid server ready.`);
    await pluginManager.onApplicationReady(this.#applicationConfig);
  }

  async configureApplication() {
    this.#applicationConfig = cloneDeep(
      this.#bootstrapApplicationConfig,
    ) as RpdApplicationConfig;

    const pluginManager = this.#pluginManager;
    await pluginManager.onLoadingApplication(this.#applicationConfig);
    await pluginManager.configureModels(this.#applicationConfig);
    await pluginManager.configureModelProperties(this.#applicationConfig);
    await pluginManager.configureRoutes(this.#applicationConfig);

    // TODO: check application configuration.

    await pluginManager.onApplicationLoaded(this.#applicationConfig);

    this.#buildedRoutes = await buildRoutes(this, this.#applicationConfig);
  }

  async queryDatabaseObject(sql: string, params?: unknown[] | Record<string,unknown>) : Promise<any[]> {
    try {
      return await this.#databaseAccessor.queryDatabaseObject(sql, params);
    } catch (err) {
      this.#logger.error("Failed to query database object.", { errorMessage: err.message, sql, params });
      throw err;
    }
  }

  async tryQueryDatabaseObject(sql: string, params?: unknown[] | Record<string,unknown>) : Promise<any[]> {
    try {
      return await this.queryDatabaseObject(sql, params);
    } catch (err) {
      this.#logger.error("Failed to query database object.", { errorMessage: err.message, sql, params });
    }

    return [];
  }

  get middlewares() {
    return this.#middlewares;
  }

  async handleRequest(request: Request, next: Next) {
    const rapidRequest = new RapidRequest(this, request);
    await rapidRequest.parseBody();
    const routeContext = new RouteContext(this, rapidRequest);
    await this.#pluginManager.onPrepareRouteContext(routeContext);

    await this.#buildedRoutes(routeContext, next);
    return routeContext.response.getResponse();
  }

  async beforeRunRouteActions(handlerContext: ActionHandlerContext) {
    await this.#pluginManager.beforeRunRouteActions(handlerContext);
  }
}
