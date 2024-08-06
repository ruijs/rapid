import type { SimpleRockConfig } from "@ruiapp/move-style";
import { FilterFieldConfig } from "../rapid-form-item/rapid-form-item-types";
import { TableSelectColumn, TableSelectRockConfig } from "../rapid-table-select/table-select-types";

export interface SonicEntityTableSelectRockConfig extends SimpleRockConfig {
  searchPlaceholder?: string;
  placeholder?: string;
  allowClear?: boolean;
  pageSize?: number;
  mode?: "multiple" | "single";
  listFilterFields?: (string | FilterFieldConfig)[]; // 默认 name、code
  listTextFormat?: string;
  listTextFieldName?: string; // 默认 name
  listValueFieldName?: string; // 默认 id
  columns?: TableSelectColumn[];
  dropdownMatchSelectWidth?: number;
  entityCode: string;
  requestParams?: TableSelectRockConfig["requestConfig"]["params"];
  value?: string | string[];
  onChange?(value: string): void;
  onSelectedRecord?(record: Record<string, any>): void;
}
