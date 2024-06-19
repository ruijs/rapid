import { CreateEntityOptions, EmitServerEventOptions, EntityWatcherType, GetDataAccessorOptions, GetModelOptions, IDatabaseConfig, IQueryBuilder, IRpdDataAccessor, RapidServerConfig, RpdApplicationConfig, RpdDataModel, RpdDataModelProperty, RpdServerEventTypes, UpdateEntityByIdOptions } from "~/types";
import { IPluginActionHandler, ActionHandler, ActionHandlerContext } from "./actionHandler";
import { Next, RouteContext } from "./routeContext";
import EntityManager from "~/dataAccess/entityManager";
import { Logger } from "~/facilities/log/LogFacility";
import { FacilityFactory } from "./facility";

export interface IRpdServer {
  config: RapidServerConfig;
  databaseConfig: IDatabaseConfig;
  queryBuilder: IQueryBuilder;
  getLogger(): Logger;

  registerFacilityFactory(factory: FacilityFactory);

  getFacility<TFacility = any>(name: string, options?: any): Promise<TFacility>;

  queryDatabaseObject: (sql: string, params?: unknown[] | Record<string, unknown>) => Promise<any[]>;
  tryQueryDatabaseObject: (sql: string, params?: unknown[] | Record<string, unknown>) => Promise<any[]>;
  registerMiddleware(middleware: any): void;
  registerActionHandler(plugin: RapidPlugin, options: IPluginActionHandler): void;
  getActionHandlerByCode(code: string): ActionHandler | undefined;
  getDataAccessor<T = any>(options: GetDataAccessorOptions): IRpdDataAccessor<T>;
  getEntityManager<TEntity = any>(singularCode: string): EntityManager<TEntity>;
  registerService(name: string, service: any);
  getService<TService>(name: string): TService;
  getApplicationConfig(): RpdApplicationConfig;
  appendApplicationConfig(config: Partial<RpdApplicationConfig>);
  appendModelProperties(modelSingularCode: string, properties: RpdDataModelProperty[]);
  getModel(options: GetModelOptions): RpdDataModel | undefined;
  registerEventHandler<K extends keyof RpdServerEventTypes>(eventName: K, listener: (...args: RpdServerEventTypes[K]) => void);
  registerEntityWatcher(entityWatcher: EntityWatcherType);
  emitEvent<TEventName extends keyof RpdServerEventTypes>(event: EmitServerEventOptions<TEventName>): void;
  handleRequest(request: Request, next: Next): Promise<Response>;
  beforeRunRouteActions(handlerContext: ActionHandlerContext): Promise<void>;
  beforeCreateEntity(model: RpdDataModel, options: CreateEntityOptions): Promise<void>;
  beforeUpdateEntity(model: RpdDataModel, options: UpdateEntityByIdOptions, currentEntity: any): Promise<void>;
}

export type RpdConfigurationItemTypes = "integer" | "text" | "boolean" | "date" | "datetime" | "json";

export interface RpdConfigurationItemOptions {
  /**
   * 配置项名称。可以包含中文。
   */
  name: string;
  /**
   * 配置项代码。
   */
  code: string;
  /**
   * 配置项类型。
   */
  type: RpdConfigurationItemTypes;
  /**
   * 是否必须有值。默认为 false。
   */
  required?: boolean;
  /**
   * 默认值。使用默认值的 JavaScript 字面量表示。
   */
  defaultValue?: string;
}

export type RpdServerPluginExtendingAbilities =
  | /** 是指提供处理网络请求的middleware的能力。 */ "extendMiddleware"
  | /** 是指增加系统中的集合的能力。 */ "extendModel"
  | /** 是指可以对模型增加属性的能力。 */ "extendProperty"
  | /** 是指增加接口动作的能力。 */ "extendActionHandler"
  | /** 是指增加或者修改接口定义的能力。 */ "extendRoute"
  | /** 是指对实体数据进行标准化的能力。 */ "normalizeEntity"
  | /** 处理事件总线发送过来的事件的能力。 */ "handleEvent"
  | /** 处理消息队列发送过来的消息的能力。 */ "handleMessage"
  | /** 对特定任务进行处理的能力。 */ "processTask";

export interface RpdServerPluginConfigurableTargetOptions {
  targetCode: string;

  configurations: RpdConfigurationItemOptions[];
}

export interface RapidPlugin {
  /** 插件代码 */
  get code(): string;
  /** 插件描述 */
  get description(): string;
  /** 插件可以提供哪些扩展能力 */
  get extendingAbilities(): RpdServerPluginExtendingAbilities[];
  /** 插件可以配置的目标实体，以及和配置目标相关的配置项 */
  get configurableTargets(): RpdServerPluginConfigurableTargetOptions[];
  /** 插件的全局配置项 */
  get configurations(): RpdConfigurationItemOptions[];
  /** 初始化插件时调用。插件可以在此时进行一些内部对象的初始化工作。 */
  initPlugin?: (server: IRpdServer) => Promise<any>;
  /** 注册中间件 */
  registerMiddlewares?: (server: IRpdServer) => Promise<any>;
  /** 注册接口动作处理程序 */
  registerActionHandlers?: (server: IRpdServer) => Promise<any>;
  /** 注册事件处理程序 */
  registerEventHandlers?: (server: IRpdServer) => Promise<any>;
  /** 注册消息处理程序 */
  registerMessageHandlers?: (server: IRpdServer) => Promise<any>;
  /** 注册任务处理程序 */
  registerTaskProcessors?: (server: IRpdServer) => Promise<any>;
  /** 在加载应用前调用。 */
  onLoadingApplication?: (server: IRpdServer, applicationConfig: RpdApplicationConfig) => Promise<any>;
  /** 配置数据集合 */
  configureModels?: (server: IRpdServer, applicationConfig: RpdApplicationConfig) => Promise<any>;
  /** 配置模型属性 */
  configureModelProperties?: (server: IRpdServer, applicationConfig: RpdApplicationConfig) => Promise<any>;
  /** 配置服务 */
  configureServices?: (server: IRpdServer, applicationConfig: RpdApplicationConfig) => Promise<any>;
  /** 配置路由 */
  configureRoutes?: (server: IRpdServer, applicationConfig: RpdApplicationConfig) => Promise<any>;
  /** 在应用配置加载完成后调用。此时插件可以进行一些数据的初始化工作。 */
  onApplicationLoaded?: (server: IRpdServer, applicationConfig: RpdApplicationConfig) => Promise<any>;
  /** 在应用准备完成后调用。此时服务器已经可以处理网络请求，可以对外广播消息。 */
  onApplicationReady?: (server: IRpdServer, applicationConfig: RpdApplicationConfig) => Promise<any>;
  /** 在接收到HTTP请求，准备路由上下文时调用。 */
  onPrepareRouteContext?: (server: IRpdServer, routeContext: RouteContext) => Promise<any>;
  /** 在接收到HTTP请求，执行 actions 前调用。 */
  beforeRunRouteActions?: (server: IRpdServer, handlerContext: ActionHandlerContext) => Promise<any>;
  /** 在创建实体前调用。 */
  beforeCreateEntity?: (server: IRpdServer, model: RpdDataModel, options: CreateEntityOptions) => Promise<any>;
  /** 在更新实体前调用。 */
  beforeUpdateEntity?: (server: IRpdServer, model: RpdDataModel, options: UpdateEntityByIdOptions, currentEntity: any) => Promise<any>;
}
