import { GetDataAccessorOptions, GetModelOptions, IDatabaseConfig, IPluginInstance, IQueryBuilder, IRpdDataAccessor, RapidServerConfig, RpdApplicationConfig, RpdDataModel, RpdServerEventTypes } from "~/types";
import { IPluginHttpHandler, HttpRequestHandler } from "./httpHandler";
import { Next } from "./routeContext";

export interface IRpdServer {
  config: RapidServerConfig;
  databaseConfig: IDatabaseConfig;
  queryBuilder: IQueryBuilder;
  queryDatabaseObject: (
    sql: string,
    params?: unknown[] | Record<string, unknown>,
  ) => Promise<any[]>;
  tryQueryDatabaseObject: (
    sql: string,
    params?: unknown[] | Record<string, unknown>,
  ) => Promise<any[]>;
  registerMiddleware(middleware: any): void;
  registerHttpHandler(
    plugin: IPluginInstance,
    options: IPluginHttpHandler,
  ): void;
  getHttpHandlerByCode(code: string): HttpRequestHandler | undefined;
  getDataAccessor<T = any>(
    options: GetDataAccessorOptions,
  ): IRpdDataAccessor<T>;
  getApplicationConfig(): RpdApplicationConfig;
  getModel(options: GetModelOptions): RpdDataModel | undefined;
  registerEventHandler<K extends keyof RpdServerEventTypes>(
    eventName: K,
    listener: (...args: RpdServerEventTypes[K]) => void,
  ): this;
  emitEvent<K extends keyof RpdServerEventTypes>(
    eventName: K,
    sender: IPluginInstance,
    payload: RpdServerEventTypes[K][1],
  ): void;
  handleRequest(request: Request, next: Next): Promise<Response>;
}



export type RpdConfigurationItemTypes =
  | "integer"
  | "text"
  | "boolean"
  | "date"
  | "datetime"
  | "json";

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
  | /** 是指增加接口动作的能力。 */ "extendHttpHandler"
  | /** 是指增加或者修改接口定义的能力。 */ "extendRoute"
  | /** 是指对实体数据进行标准化的能力。 */ "normalizeEntity"
  | /** 处理事件总线发送过来的事件的能力。 */ "handleEvent"
  | /** 处理消息队列发送过来的消息的能力。 */ "handleMessage"
  | /** 对特定任务进行处理的能力。 */ "processTask";

export interface RpdServerPluginConfigurableTargetOptions {
  targetCode: string;

  configurations: RpdConfigurationItemOptions[];
}

export interface IRpdServerPlugin {
  /** 插件代码 */
  code: string;
  /** 插件描述 */
  description: string;
  /** 插件可以提供哪些扩展能力 */
  extendingAbilities: RpdServerPluginExtendingAbilities[];
  /** 插件可以配置的目标实体，以及和配置目标相关的配置项 */
  configurableTargets?: RpdServerPluginConfigurableTargetOptions[];
  /** 插件的全局配置项 */
  configurations?: RpdConfigurationItemOptions[];
  /** 初始化插件时调用。插件可以在此时进行一些内部对象的初始化工作。 */
  initPlugin: (plugin: IPluginInstance, server: IRpdServer) => Promise<any>;
  /** 注册中间件 */
  registerMiddlewares?: (server: IRpdServer) => Promise<any>;
  /** 注册接口动作处理程序 */
  registerHttpHandlers?: (server: IRpdServer) => Promise<any>;
  /** 注册事件处理程序 */
  registerEventHandlers?: (server: IRpdServer) => Promise<any>;
  /** 注册消息处理程序 */
  registerMessageHandlers?: (server: IRpdServer) => Promise<any>;
  /** 注册任务处理程序 */
  registerTaskProcessors?: (server: IRpdServer) => Promise<any>;
  /** 在加载应用前调用。 */
  onLoadingApplication?: (
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) => Promise<any>;
  /** 配置数据集合 */
  configureModels?: (
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) => Promise<any>;
  /** 配置模型属性 */
  configureModelProperties?: (
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) => Promise<any>;
  /** 配置路由 */
  configureRoutes?: (
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) => Promise<any>;
  /** 在应用配置加载完成后调用。此时插件可以进行一些数据的初始化工作。 */
  onApplicationLoaded?: (
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) => Promise<any>;
  /** 在应用准备完成后调用。此时服务器已经可以处理网络请求，可以对外广播消息。 */
  onApplicationReady?: (
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) => Promise<any>;
}

