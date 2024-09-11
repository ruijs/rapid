import type { RockConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { EntityFilterOptions, FindEntityOrderByOptions, FindEntityFindRelationEntitiesOptions } from "../../types/rapid-entity-types";
import { RapidTableColumnConfig } from "../rapid-table-column/rapid-table-column-types";
import { RapidRecordAction } from "../../types/rapid-action-types";

export interface RapidEntityListConfig {
  /**
   * 实体类型
   */
  entityCode: string;

  /**
   * 实体名称
   */
  entityName?: string;

  /**
   * 视图模式
   */
  viewMode: "table";

  /**
   * 数据源类型  默认：store, 从store中读取对应的数据
   */
  dataSourceType?: "store" | "dataSource";

  /**
   * 数据
   */
  dataSource?: any[];

  /**
   * 数据源编号
   */
  dataSourceCode?: string;

  /**
   * 固定过滤器
   */
  fixedFilters?: EntityFilterOptions[];

  /**
   * 排序规则
   */
  orderBy?: FindEntityOrderByOptions[];

  /**
   * 分页大小。小于或者等于0时表示不分页。
   */
  pageSize?: number;

  pageNum?: number;

  selectionMode?: "none" | "single" | "multiple";

  /**
   * 针对列表的操作
   */
  listActions?: RockConfig[];

  extraActions?: RockConfig[];

  columns: RapidTableColumnConfig[];

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
   * 针对记录的操作
   */
  actions?: RockConfig[];

  /**
   * 操作列的宽度
   */
  actionsColumnWidth?: string;

  /**
   * 是否显示表头。默认为`true`。
   */
  showHeader?: boolean;

  /**
   * 是否隐藏操作列。默认为`false`。
   */
  hideActionsColumn?: boolean;

  /**
   * 表格的属性
   */
  tableProps?: Record<string, any>;

  /**
   * 是否在点击行时选中
   */
  selectOnClickRow?: boolean;

  onSelectedIdsChange?: RockEventHandlerConfig;

  /**
   * dataSource 适配器， 遵循 rui expression 规范（解析）
   */
  dataSourceAdapter?: string;

  enabledFilterCache?: boolean;
  filterCacheName?: string;
}

export interface RapidEntityListRockConfig extends SimpleRockConfig, RapidEntityListConfig {}

export interface RapidEntityListState {
  selectedIds?: any[];
}
