import type { RockConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import type { EntityFilterFieldOperators, EntityFilterOptions, FindEntityOrderByOptions } from "../../types/rapid-entity-types";
import type { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";
import type { RapidTableColumnConfig } from "../rapid-table-column/rapid-table-column-types";
import { IRapidEntityListToolboxConfig } from "../rapid-entity-list-toolbox/RapidEntityListToolbox";

export interface SonicToolbarSelectEntityButtonConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
  /**
   * 实体类型
   */
  entityCode: string;

  /**
   * 实体名称
   */
  entityName?: string;

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

  /**
   * 指定数据查询的属性。如果指定了`queryProperties`，则不会自动从`columns`和`extraProperties`中提取查询属性。
   */
  queryProperties?: string[];

  /**
   * 数据查询时需要查询的额外属性。
   */
  extraProperties?: string[];

  /**
   * 对话框属性
   */
  modalProps?: any;

  columns: RapidTableColumnConfig[];

  extraActions?: RockConfig[];

  toolbox?: IRapidEntityListToolboxConfig;

  quickSearchMode?: EntityFilterFieldOperators;

  quickSearchFields?: string[];

  /**
   * 是否在点击行时选中
   */
  selectOnClickRow?: boolean;

  onSelected?: RockEventHandlerConfig;
}

export interface SonicToolbarSelectEntityButtonRockConfig extends SimpleRockConfig, SonicToolbarSelectEntityButtonConfig {}
