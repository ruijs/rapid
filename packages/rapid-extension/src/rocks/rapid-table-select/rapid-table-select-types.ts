import type { RockEventHandlerConfig, RockExpsConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { FindEntityOptions } from "../../rapid-types";
import { FilterFieldConfig } from "../rapid-form-item/rapid-form-item-types";
import { RapidTableColumnConfig } from "../rapid-table-column/rapid-table-column-types";

export interface RapidTableSelectConfigBase {
  searchPlaceholder?: string;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  bordered?: boolean;

  /**
   * 分页大小。小于或者等于0时表示不分页。
   */
  pageSize?: number;
  mode?: "multiple" | "single";
  listFilterFields?: (string | FilterFieldConfig)[]; // 默认 name、code

  /**
   * @deprecated use labelRendererType
   */
  listTextFormat?: string;
  listTextFieldName?: string;
  /**
   * 默认 id
   */
  listValueFieldName?: string;
  columns?: RapidTableColumnConfig[];
  dropdownMatchSelectWidth?: number;
  value?: string | string[];
  onChange?(value: string): void;
  onSelectedRecord?: RockEventHandlerConfig;

  /**
   * 标签渲染器类型
   */
  labelRendererType?: string;

  /**
   * 标签渲染器属性
   */
  labelRendererProps?: Record<string, any>;

  /**
   * 表格高度
   */
  tableHeight?: number;
}

export interface RapidTableSelectConfig extends RapidTableSelectConfigBase {
  requestConfig: RapidTableSelectRequestConfig;
}

export interface RapidTableSelectRockConfig extends RapidTableSelectConfig, SimpleRockConfig {
  requestConfig: {
    baseUrl?: string;
    url: string;
    method?: "post" | "get"; // 默认 post
    params?: FindEntityOptions & {
      fixedFilters?: FindEntityOptions["filters"];
      $exps?: RockExpsConfig;
    };
  };
}

export type RapidTableSelectRequestConfig = {
  baseUrl?: string;
  url: string;
  method?: "post" | "get"; // 默认 post
  params?: FindEntityOptions & {
    fixedFilters?: FindEntityOptions["filters"];
    $exps?: RockExpsConfig;
  };
};
