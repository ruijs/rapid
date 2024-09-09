import type { SimpleRockConfig } from "@ruiapp/move-style";
import { FilterFieldConfig } from "../rapid-form-item/rapid-form-item-types";
import { RapidTableSelectColumn, RapidTableSelectRockConfig } from "../rapid-table-select/rapid-table-select-types";

export interface SonicEntityTableSelectRockConfig extends SimpleRockConfig {
  searchPlaceholder?: string;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  pageSize?: number;
  mode?: "multiple" | "single";
  listFilterFields?: (string | FilterFieldConfig)[]; // 默认 name、code
  listTextFormat?: string;
  listTextFieldName?: string; // 默认 name
  listValueFieldName?: string; // 默认 id
  columns?: RapidTableSelectColumn[];
  dropdownMatchSelectWidth?: number;
  entityCode: string;
  requestParams?: RapidTableSelectRockConfig["requestConfig"]["params"];
  value?: string | string[];
  onChange?(value: string): void;
  onSelectedRecord?(record: Record<string, any>, selectedRecords: Record<string, any>[]): void;
}
