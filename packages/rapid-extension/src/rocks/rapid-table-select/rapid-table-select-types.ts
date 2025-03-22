import type { RockExpsConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { FindEntityOptions } from "../../rapid-types";
import { FilterFieldConfig } from "../rapid-form-item/rapid-form-item-types";
import { RapidTableColumnConfig } from "../rapid-table-column/rapid-table-column-types";

export interface RapidTableSelectRockConfig extends SimpleRockConfig {
  searchPlaceholder?: string;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  bordered?: boolean;
  pageSize?: number;
  mode?: "multiple" | "single";
  listFilterFields?: (string | FilterFieldConfig)[]; // 默认 name、code
  listTextFormat?: string;
  listTextFieldName?: string; // 默认 name
  listValueFieldName?: string; // 默认 id
  columns?: RapidTableColumnConfig[];
  dropdownMatchSelectWidth?: number;
  requestConfig: {
    baseUrl?: string;
    url: string;
    method?: "post" | "get"; // 默认 post
    params?: FindEntityOptions & {
      fixedFilters?: FindEntityOptions["filters"];
      $exps?: RockExpsConfig;
    };
  };
  value?: string | string[];
  onChange?(value: string): void;
  onSelectedRecord?(record: Record<string, any>, selectedRecords: Record<string, any>[]): void;

  /**
   * 表格高度
   */
  tableHeight?: number;
}
