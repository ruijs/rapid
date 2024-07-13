export type RowFilterRelationalOperators =
  | "eq"
  | "ne"
  | "lt"
  | "lte"
  | "gt"
  | "gte"
  | "contains"
  | "notContains"
  | "containsCS"
  | "notContainsCS"
  | "startsWith"
  | "notStartsWith"
  | "endsWith"
  | "notEndsWith";

export type RowFilterSetOperators = "in" | "notIn";

export type RowFilterLogicalOperators = "or" | "and";

export type RowFilterUnaryOperators = "null" | "notNull";

export type RowFilterExistenceOperators = "exists" | "notExists";

export type RowFilterOperators =
  | RowFilterRelationalOperators
  | RowFilterSetOperators
  | RowFilterLogicalOperators
  | RowFilterUnaryOperators
  | RowFilterExistenceOperators;

export type RowFilterOptions =
  | FindRowRelationalFilterOptions
  | FindRowSetFilterOptions
  | FindRowLogicalFilterOptions
  | FindRowUnaryFilterOptions
  | FindRowExistenceFilterOptions;

export type RowNonRelationPropertyFilterOptions = FindRowRelationalFilterOptions | FindRowSetFilterOptions | FindRowUnaryFilterOptions;

export type ColumnSelectOptions = string | ColumnNameWithTableName;

export type ColumnNameWithTableName = {
  name: string;
  tableName?: string;
  schema?: string;
};

export interface FindRowOptions {
  filters?: RowFilterOptions[];
  orderBy?: FindRowOrderByOptions[];
  pagination?: FindRowPaginationOptions;
  // TODO: may be `columns` is a better name.
  fields?: ColumnSelectOptions[];
  keepNonPropertyFields?: boolean;
}

export interface FindRowRelationalFilterOptions {
  // TODO: may be `column` is a better name.
  field: ColumnSelectOptions;
  operator: RowFilterRelationalOperators;
  value: any;
}

export interface FindRowSetFilterOptions {
  field: ColumnSelectOptions;
  operator: RowFilterSetOperators;
  value: any[];
  itemType?: string;
}

export interface FindRowLogicalFilterOptions {
  operator: RowFilterLogicalOperators;
  filters: RowFilterOptions[];
}

export interface FindRowUnaryFilterOptions {
  field: ColumnSelectOptions;
  operator: RowFilterUnaryOperators;
}

export interface FindRowExistenceFilterOptions {
  field: ColumnSelectOptions;
  operator: RowFilterExistenceOperators;
  filters: RowFilterOptions[];
}

export interface FindRowPaginationOptions {
  offset: number;
  limit: number;
  withoutTotal?: boolean;
}

export interface FindRowOrderByOptions {
  /**
   * 排序字段
   */
  field: ColumnSelectOptions;

  /**
   * 是否倒序
   */
  desc?: boolean;

  /**
   * 关系字段
   */
  relationField?: ColumnNameWithTableName;
}

export interface CountRowOptions {
  filters?: RowFilterOptions[];
}

export interface UpdateRowOptions {
  filters?: RowFilterOptions[];
  entity: any;
}

export interface DeleteRowOptions {
  filters?: RowFilterOptions[];
}
