import type { RockEventHandlerConfig, RockPropExpressions, SimpleRockConfig } from "@ruiapp/move-style";
import { ReactNode } from "react";
import { FindEntityOptions } from "../../rapid-types";
import { FilterFieldConfig } from "../rapid-form-item/rapid-form-item-types";

export interface TableSelectColumn {
  code: string;
  title?: string;
  width?: number;
  fixed?: "left" | "right";
  format?: string;
  render?: string | ((record: any) => ReactNode);
}

export interface TableSelectRockConfig extends SimpleRockConfig {
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
  columns?: TableSelectColumn[];
  dropdownMatchSelectWidth?: number;
  requestConfig: {
    baseUrl?: string;
    url: string;
    method?: "post" | "get"; // 默认 post
    params?: FindEntityOptions & {
      fixedFilters?: FindEntityOptions["filters"];

      $exps?: RockPropExpressions;
    };
  };
  value?: string | string[];
  onChange?(value: string): void;
  onSelectedRecord?(record: Record<string, any>, selectedRecords: Record<string, any>[]): void;
}
