import { ActionHandlerContext } from "./core/actionHandler";
import { RouteContext } from "./core/routeContext";
import { IRpdServer, RapidPlugin } from "./core/server";
import { ColumnSelectOptions, CountRowOptions, FindRowOptions, RowFilterOptions } from "./dataAccess/dataAccessTypes";

export type RapidServerConfig = {
  baseUrl?: string;
  sessionCookieName: string;
  jwtKey: string;
  localFileStoragePath: string;
};

export interface IDatabaseConfig {
  dbHost?: string;
  dbPort?: number;
  dbName?: string;
  dbUser?: string;
  dbPassword?: string;
  dbDefaultSchema?: string;
  dbPoolConnections?: number;
}

export type DatabaseQuery = {
  command: string;
  params?: unknown[] | Record<string, unknown>;
};

export interface IDatabaseClient {
  release();
  query(sql: any, params?: any): Promise<any>;
}

export interface IDatabaseAccessor {
  getClient(): Promise<IDatabaseClient>;
  queryDatabaseObject: (sql: string, params?: unknown[] | Record<string, unknown>, client?: IDatabaseClient) => Promise<any[]>;
}

export type RunActionHandlersOptions = {
  actions: RpdRouteActionConfig[];
};

export interface RunEntityActionHandlerOptions {
  /** 模型所在的命名空间 */
  namespace: string;
  /** 模型Code的单数表示 */
  singularCode: string;
  /** 默认输入 */
  defaultInput: Record<string, any>;
  /** 固定输入 */
  fixedInput: Record<string, any>;
}

export interface RunQueryDatabaseHandlerOptions {
  sql: string;

  querySingle?: boolean;

  /** 默认输入 */
  defaultInput: Record<string, any>;
  /** 固定输入 */
  fixedInput: Record<string, any>;
}

export interface RunProxyHandlerOptions {
  /** Timeout milli seconds, default as 60000 */
  timeout?: number;
  /** Target url to proxy */
  target: string;
}

export interface RunMockHandlerOptions {
  /**
   * 响应时间，毫秒
   */
  responseTime?: number;

  /**
   * 响应状态
   */
  responseStatus?: number;

  /**
   * 响应头
   */
  responseHeaders?: Record<string, string>;

  /**
   * 响应体
   */
  responseBody?: any;
}

export interface GetDataAccessorOptions {
  namespace?: string;
  singularCode: string;
}

export interface GetModelOptions {
  namespace?: string;
  singularCode: string;
}

export type RpdServerEventTypes = {
  "entity.beforeCreate": [RapidPlugin, RpdEntityBeforeCreateEventPayload, RouteContext?];
  "entity.create": [RapidPlugin, RpdEntityCreateEventPayload, RouteContext?];
  "entity.beforeUpdate": [RapidPlugin, RpdEntityBeforeUpdateEventPayload, RouteContext?];
  "entity.update": [RapidPlugin, RpdEntityUpdateEventPayload, RouteContext?];
  "entity.beforeDelete": [RapidPlugin, RpdEntityBeforeDeleteEventPayload, RouteContext?];
  "entity.delete": [RapidPlugin, RpdEntityDeleteEventPayload, RouteContext?];
  "entity.addRelations": [RapidPlugin, RpdEntityAddRelationsEventPayload, RouteContext?];
  "entity.removeRelations": [RapidPlugin, RpdEntityRemoveRelationsEventPayload, RouteContext?];
  "entity.beforeResponse": [RapidPlugin, RpdEntityBeforeResponseEventPayload, RouteContext?];
};

export interface RpdEntityBeforeCreateEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  before: any;
}

export interface RpdEntityCreateEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  after: any;
}

export interface RpdEntityBeforeUpdateEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  before: any;
  changes: any;
  operation?: {
    type: string;
  };
  stateProperties?: string[];
}

export interface RpdEntityUpdateEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  before: any;
  after: any;
  changes: any;
  operation?: {
    type: string;
  };
  stateProperties?: string[];
}

export interface RpdEntityBeforeDeleteEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  before: any;
}

export interface RpdEntityDeleteEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  before: any;
}

export interface RpdEntityAddRelationsEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  entity: any;
  property: string;
  relations: any[];
}

export interface RpdEntityRemoveRelationsEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  entity: any;
  property: string;
  relations: any[];
}

export interface RpdEntityBeforeResponseEventPayload {
  namespace: string;
  modelSingularCode: string;
  baseModelSingularCode?: string;
  entities: any[];
}

export type EmitServerEventOptions<TEventName extends keyof RpdServerEventTypes> = {
  eventName: TEventName;
  payload: RpdServerEventTypes[TEventName][1];
  sender?: RapidPlugin;
  routeContext?: RouteContext;
};

export interface QuoteTableOptions {
  schema?: string;
  tableName: string;
}

export interface IQueryBuilder {
  quoteTable: (options: QuoteTableOptions) => string;
  quoteObject: (name: string) => string;
  buildFiltersExpression(model: RpdDataModel, filters: RowFilterOptions[]);
  formatValueToSqlLiteral: (value: any) => string;
}

export interface RpdApplicationConfig {
  code?: string;
  name?: string;
  models: RpdDataModel[];
  dataDictionaries: RpdDataDictionary[];
  routes: RpdRoute[];
}

export interface RpdDataModel {
  maintainedBy?: string;
  name: string;
  namespace: string;
  code?: string;
  singularCode: string;
  pluralCode: string;
  schema?: string;
  tableName: string;
  /**
   * Configure the singular code of base entity.
   */
  base?: string;
  /**
   * Configure the type of derived entity.
   */
  derivedType?: string;
  /**
   * Configure the property code to save derived type for base entity.
   */
  derivedTypePropertyCode?: string;

  /**
   * Indicates whether the entity is deprecated.
   */
  deprecated?: boolean;

  /**
   * Configure the property code used to display the entity.
   */
  displayPropertyCode?: string;

  /**
   * 默认排序方式
   */
  defaultOrderBy?: FindEntityOrderByOptions[];

  properties: RpdDataModelProperty[];
  indexes?: RpdDataModelIndex[];
  extensions?: RpdDataModelExtension[];
  permissionPolicies?: RpdDataModelPermissionPolicies;
  /**
   * 是否使用软删除
   */
  softDelete?: boolean;

  /**
   * 多语言配置
   */
  i18n?: Record<string, string>;

  /**
   * 本地化资源
   */
  locales?: Record<string, RpdDataModelLocale>;
}

/**
 * 实体本地化资源配置
 */
export type RpdDataModelLocale = {
  name: string;
  description?: string;
  properties?: Record<string, RpdDataModelPropertyLocale>;
};

export interface RpdDataModelPermissionPolicies {
  find?: PermissionPolicy;
  create?: PermissionPolicy;
  update?: PermissionPolicy;
  delete?: PermissionPolicy;
}

export interface PermissionPolicy {
  any?: string[];
  all?: string[];
}

export interface RpdDataModelProperty {
  /**
   * 表示此属性由谁来维护
   */
  maintainedBy?: string;
  /**
   * 表示是否基础属性
   */
  isBaseProperty?: boolean;
  /**
   * 字段名称。可以包含中文。
   */
  name: string;
  /**
   * 字段代码。会用于数据表列名和 API 的字段名。
   */
  code: string;
  /**
   * 字段描述。
   */
  description?: string;
  /**
   * 数据表列名。如果没有设置则使用 code。
   */
  columnName?: string;
  /**
   * 字段类型。
   */
  type: RpdDataPropertyTypes;

  /**
   * Indicates whether the property is deprecated.
   */
  deprecated?: boolean;

  /**
   * 是否必须有值。默认为 false。
   */
  required?: boolean;
  /**
   * 默认值。使用默认值的 SQL 表达式表示。
   */
  defaultValue?: string;
  /**
   * 属性配置。
   */
  // deno-lint-ignore no-explicit-any
  config?: Record<string, any>;
  /**
   * 是否自增长。
   */
  autoIncrement?: boolean;
  /**
   * 字段值的最小长度。
   */
  minLength?: number;
  /**
   * 字段值的最大长度。
   */
  maxLength?: number;
  /**
   * 当 type 为 relation 时，设置关联实体为一个还是多个。
   */
  relation?: "one" | "many";
  /**
   * 关联实体的singular code，不管 relation 为 one 或者 many 都需要设置。
   */
  targetSingularCode?: string;
  /**
   * 保存关联实体类型的字段名。当设置 targetTypeColumnName 时，表示关联实体类型不固定，可以关联不同类型的实体。
   */
  targetTypeColumnName?: string;
  /**
   * 当 relation 为 one 时，设置当前模型表中表示关联实体 id 的列名。
   * 当 relation 为 many，并且使用关联关系表保存关联信息时，设置关联关系表中表示关联实体 id 的列名。
   * 当 relation 为 many，并且不使用关联关系表保存关联信息时，关联实体 id 的列名默认为`id`，此时可以不设置 targetIdColumnName。
   */
  targetIdColumnName?: string;
  /**
   * 当 relation 为 many 时，设置目标模型表或关联关系表中表示自身实体 id 的列名。
   */
  selfIdColumnName?: string;
  /**
   * 当 relation 为 many 时，可以使用关联关系表保存关联信息，此时需要设置关联关系表的名称。
   */
  linkTableName?: string;
  /**
   * 当设置了 linkTableName 时，可以设置关联关系表所在的 Schema。
   */
  linkSchema?: string;

  /**
   * 数据字典编码。当类型为option时设置
   */
  dataDictionary?: string;

  /**
   * 当删除实体时，针对关系属性的联动处理。
   */
  entityDeletingReaction?: RpdEntityDeleteRelationPropertyReaction;

  /**
   * 当设置为`true`时，仅允许在创建时设置此属性的值，不允许更新。
   */
  readonly?: boolean;

  /**
   * 多语言配置
   */
  i18n?: Record<string, string>;

  /**
   * 本地化资源
   */
  locales?: Record<string, RpdDataModelPropertyLocale>;
}

/**
 * 实体属性本地化资源配置
 */
export type RpdDataModelPropertyLocale = {
  name: string;
  description?: string;
};

export type RpdDataPropertyTypes =
  | "integer"
  | "long"
  | "float"
  | "double"
  | "decimal"
  | "text"
  | "boolean"
  | "date"
  | "time"
  | "datetime"
  | "json"
  | "relation"
  | "relation[]"
  | "option"
  | "option[]"
  | "file"
  | "file[]"
  | "image"
  | "image[]";

export type RpdEntityDeleteRelationPropertyReaction = "doNothing" | "unlink" | "cascadingDelete";

/**
 * 数据字典
 */
export type RpdDataDictionary = {
  /**
   * 字典编码
   */
  code: string;

  /**
   * 字典名称
   */
  name?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 字典项值类型
   */
  valueType: "string" | "integer";

  /**
   * 字典级别
   */
  level: "sys" | "app" | "user";

  /**
   * 字典项
   */
  entries: RpdDataDictionaryEntry[];

  /**
   * 多语言配置
   */
  i18n?: Record<string, string>;

  /**
   * 本地化资源
   */
  locales?: Record<string, RpdDataDictionaryLocale>;

  /**
   * Indicates whether the data dictionary is deprecated.
   */
  deprecated?: boolean;
};

export type RpdDataDictionaryLocale = {
  name: string;
  description?: string;
};

/**
 * 数据字典项
 */
export type RpdDataDictionaryEntry = {
  /**
   * 名称
   */
  name: string;

  /**
   * 值
   */
  value: string;

  /**
   * 颜色
   */
  color?: string;

  /**
   * 图标
   */
  icon?: string;

  /**
   * 描述
   */
  description?: string;

  /**
   * 排序号
   */
  orderNum: number;

  /**
   * 是否禁用
   */
  disabled: boolean;

  /**
   * 多语言配置
   */
  i18n?: Record<string, string>;

  /**
   * 本地化资源
   */
  locales?: Record<string, RpdDataDictionaryEntryLocale>;

  /**
   * Indicates whether the data dictionary entry is deprecated.
   */
  deprecated?: boolean;
};

/**
 * 数据字典项本地化资源配置
 */
export type RpdDataDictionaryEntryLocale = {
  name: string;
  description?: string;
};

export interface RpdDataModelExtension {
  code: string;
  config: any;
}

export interface RpdDataModelIndex {
  name?: string;
  unique?: boolean;
  properties: RpdDataModelIndexPropertyConfig[];
  conditions?: RpdDataModelIndexOptions[];

  /**
   * 重复时的错误信息。
   */
  duplicateErrorMessage?: string;
}

export type RpdDataModelIndexPropertyConfig =
  | string
  | {
      code: string;
      order?: "asc" | "desc";
    };

export type RpdDataModelIndexOptions =
  | FindEntityRelationalFilterOptions
  | FindEntitySetFilterOptions
  | FindEntityLogicalFilterOptions<RpdDataModelIndexOptions>
  | FindEntityUnaryFilterOptions;

export type EventHandler<T = any> = (sender: RapidPlugin, payload: T) => void;

export interface RpdRoute {
  name: string;
  namespace: string;
  code: string;
  type: "RESTful";
  method: RpdHttpMethod;
  endpoint: string;
  actions?: RpdRouteActionConfig[];
  handler?: string | ((ctx: ActionHandlerContext) => Promise<void>);
}

export type RpdHttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface RpdRouteActionConfig {
  code: string;
  config?: any;
}

export interface IRpdDataAccessor<T = any> {
  getModel(): RpdDataModel;
  create(entity: any, databaseClient: IDatabaseClient | null): Promise<any>;
  updateById(id: any, entity: any, databaseClient: IDatabaseClient | null): Promise<any>;
  find(options: FindRowOptions, databaseClient: IDatabaseClient | null): Promise<T[]>;
  findOne(options: FindRowOptions, databaseClient: IDatabaseClient | null): Promise<T | null>;
  findById(id: any, databaseClient: IDatabaseClient | null): Promise<T | null>;
  count(options: CountRowOptions, databaseClient: IDatabaseClient | null): Promise<number>;
  deleteById(id: any, databaseClient: IDatabaseClient | null): Promise<void>;
}

export type EntityFilterRelationalOperators =
  | "eq"
  | "ne"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "matches"
  | "matchesCS"
  | "contains"
  | "notContains"
  | "containsCS"
  | "notContainsCS"
  | "startsWith"
  | "notStartsWith"
  | "endsWith"
  | "notEndsWith";

export type EntityFilterArrayOperators = "arrayContains" | "arrayOverlap";

export type EntityFilterSetOperators = "in" | "notIn";

export type EntityFilterLogicalOperators = "or" | "and";

export type EntityFilterUnaryOperators = "null" | "notNull";

export type EntityFilterExistenceOperators = "exists" | "notExists";

export type EntityFilterOperators =
  | EntityFilterRelationalOperators
  | EntityFilterArrayOperators
  | EntityFilterSetOperators
  | EntityFilterLogicalOperators
  | EntityFilterUnaryOperators
  | EntityFilterExistenceOperators;

export type EntityFilterOptions =
  | FindEntityRelationalFilterOptions
  | FindEntityArrayFilterOptions
  | FindEntitySetFilterOptions
  | FindEntityLogicalFilterOptions
  | FindEntityUnaryFilterOptions
  | FindEntityExistenceFilterOptions;

export type EntityNonRelationPropertyFilterOptions =
  | FindEntityRelationalFilterOptions
  | FindEntityArrayFilterOptions
  | FindEntitySetFilterOptions
  | FindEntityUnaryFilterOptions;

export interface FindEntityOptions {
  routeContext?: RouteContext;
  filters?: EntityFilterOptions[];
  orderBy?: FindEntityOrderByOptions[];
  pagination?: FindEntityPaginationOptions;
  properties?: string[];
  relations?: Record<string, FindEntityFindRelationEntitiesOptions>;
  extraColumnsToSelect?: ColumnSelectOptions[];
  keepNonPropertyFields?: boolean;
  /**
   * 是否包含已经软删除的实体
   */
  includingSoftDeleted?: boolean;
}

export interface FindEntityByIdOptions {
  routeContext?: RouteContext;
  id: any;
  properties?: string[];
  relations?: Record<string, FindEntityFindRelationEntitiesOptions>;
  keepNonPropertyFields?: boolean;
}

export interface FindEntityRelationalFilterOptions {
  field: string;
  operator: EntityFilterRelationalOperators;
  value: any;
}

export interface FindEntityArrayFilterOptions {
  field: string;
  operator: EntityFilterArrayOperators;
  value: any[];
  itemType?: string;
}

export interface FindEntitySetFilterOptions {
  field: string;
  operator: EntityFilterSetOperators;
  value: any[];
  itemType?: string;
}

export interface FindEntityLogicalFilterOptions<TFilter = EntityFilterOptions> {
  operator: EntityFilterLogicalOperators;
  filters: TFilter[];
}

export interface FindEntityUnaryFilterOptions {
  field: string;
  operator: EntityFilterUnaryOperators;
}

export interface FindEntityExistenceFilterOptions {
  field: string;
  operator: EntityFilterExistenceOperators;
  filters: EntityFilterOptions[];
  includingSoftDeleted?: boolean;
}

export interface FindEntityPaginationOptions {
  offset: number;
  limit: number;
  withoutTotal?: boolean;
}

export type FindEntityFindRelationEntitiesOptions = FindEntityFindOneRelationEntitiesOptions | FindEntityFindManyRelationEntitiesOptions;

export type FindEntityFindOneRelationEntitiesOptions =
  | true
  | {
      properties?: string[];
      relations?: Record<string, FindEntityFindRelationEntitiesOptions>;
      keepNonPropertyFields?: boolean;
      includingSoftDeleted?: boolean;
    };

export type FindEntityFindManyRelationEntitiesOptions =
  | true
  | {
      properties?: string[];
      relations?: Record<string, FindEntityFindRelationEntitiesOptions>;
      filters?: EntityFilterOptions[];
      orderBy?: FindEntityOrderByOptions[];
      pagination?: FindEntityPaginationOptions;
      keepNonPropertyFields?: boolean;
      includingSoftDeleted?: boolean;
    };

export interface FindEntityOrderByOptions {
  field: string;
  desc?: boolean;
}

export interface CountEntityOptions {
  routeContext?: RouteContext;
  filters?: EntityFilterOptions[];
}

export interface CountEntityResult {
  count: number;
}

export interface DeleteEntityByIdOptions {
  routeContext?: RouteContext;
  id: any;
}

export interface CreateEntityOptions {
  routeContext?: RouteContext;
  entity: any;
  postponeUniquenessCheck?: boolean;
}

export interface UpdateEntityOptions {
  routeContext?: RouteContext;
  filters?: EntityFilterOptions[];
  entity: any;
}

export interface UpdateEntityByIdOptions {
  routeContext?: RouteContext;
  id: any;
  entityToSave: any;
  operation?: {
    type: string;
  };
  /**
   * 指定需要更新那几个状态属性（配置了`config.stateMachine`的属性）。当不指定时默认更新全部状态属性。
   */
  stateProperties?: string[];
  postponeUniquenessCheck?: boolean;
  /**
   * 指定需要更新关联对象的哪些属性。更新实体时，会创建关联对象，但是默认不更新关联对象的属性。
   */
  relationPropertiesToUpdate?: Record<string, UpdateRelationPropertyOptions>;
}

export type UpdateRelationPropertyOptions =
  | true
  | {
      // TODO: impl savingMode 'patch'
      // savingMode?: "overwrite" | "patch";

      /**
       * 当需移除关系时是删除关联实体，还是取消关联。默认为`delete`。此配置仅对没有配置`linkTableName`的属性有效。
       */
      relationRemoveMode?: "unlink" | "delete";
      propertiesToUpdate?: string[];
      relationPropertiesToUpdate?: Record<string, UpdateRelationPropertyOptions>;
    };

export interface DeleteEntityOptions {
  routeContext?: RouteContext;
  filters?: EntityFilterOptions[];
}

export interface AddEntityRelationsOptions {
  routeContext?: RouteContext;
  id: number;
  property: string;
  relations: { id?: number; [k: string]: any }[];
}

export interface RemoveEntityRelationsOptions {
  routeContext?: RouteContext;
  id: number;
  property: string;
  relations: { id?: number; [k: string]: any }[];
}

export type EntityWatcherType =
  | EntityWatcher<"entity.beforeCreate">
  | EntityWatcher<"entity.create">
  | EntityWatcher<"entity.beforeUpdate">
  | EntityWatcher<"entity.update">
  | EntityWatcher<"entity.beforeDelete">
  | EntityWatcher<"entity.delete">
  | EntityWatcher<"entity.addRelations">
  | EntityWatcher<"entity.removeRelations">
  | EntityWatcher<"entity.beforeResponse">
  | EntityWatcher<any>;

export interface EntityWatcher<TEventName extends keyof RpdServerEventTypes> {
  eventName: TEventName;
  modelSingularCode: string;
  handler: EntityWatchHandler<TEventName>;
}

export type EntityWatchHandler<TEventName extends keyof RpdServerEventTypes> = (ctx: EntityWatchHandlerContext<TEventName>) => Promise<void>;

export type EntityWatchHandlerContext<TEventName extends keyof RpdServerEventTypes> = {
  server: IRpdServer;
  payload: RpdServerEventTypes[TEventName][1];
  routerContext: RouteContext;
};

export interface EntityWatchPluginInitOptions {
  watchers: EntityWatcherType[];
}

export interface LocaleString {
  namespace: string;
  name: string;
  lingual: string;
  text?: string;
}
