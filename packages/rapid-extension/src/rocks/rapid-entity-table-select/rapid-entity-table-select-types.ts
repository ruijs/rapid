import { SimpleRockConfig } from "@ruiapp/move-style";
import { EntityFilterOptions, FindEntityFindRelationEntitiesOptions, FindEntityOrderByOptions } from "../../types/rapid-entity-types";
import { RapidTableSelectConfigBase, RapidTableSelectRequestConfig } from "../rapid-table-select/rapid-table-select-types";

export interface RapidEntityTableSelectConfig extends RapidTableSelectConfigBase {
  entityCode: string;

  requestConfig?: RapidTableSelectRequestConfig;

  /**
   * 固定过滤器
   */
  fixedFilters?: EntityFilterOptions[];

  /**
   * 排序规则
   */
  orderBy?: FindEntityOrderByOptions[];

  /**
   * 指定数据查询的属性。如果指定了`queryProperties`，则不会自动从`columns`和`extraProperties`中提取查询属性。
   */
  queryProperties?: string[];

  /**
   * 数据查询时需要查询的额外属性。
   */
  extraProperties?: string[];

  /**
   * 查询关联对象的设置
   */
  relations?: Record<string, FindEntityFindRelationEntitiesOptions>;

  /**
   * 列表查询结果中是否保留非属性字段。
   */
  keepNonPropertyFields?: boolean;
}

export interface RapidEntityTableSelectRockConfig extends RapidEntityTableSelectConfig, SimpleRockConfig {}
