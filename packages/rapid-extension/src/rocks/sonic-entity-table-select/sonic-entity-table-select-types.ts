import type { SimpleRockConfig } from "@ruiapp/move-style";
import { FilterFieldConfig } from "../rapid-form-item/rapid-form-item-types";
import { RapidTableSelectRockConfig } from "../rapid-table-select/rapid-table-select-types";
import { RapidTableColumnConfig } from "../rapid-table-column/rapid-table-column-types";

export interface SonicEntityTableSelectRockConfig extends SimpleRockConfig {
  searchPlaceholder?: string;
  placeholder?: string;
  allowClear?: boolean;
  disabled?: boolean;
  pageSize?: number;
  mode?: "multiple" | "single";

  /**
   * 是否禁用搜索
   */
  filterDisabled?: boolean;

  /**
   * 默认 name
   */
  listFilterFields?: (string | FilterFieldConfig)[];

  /**
   * @deprecated use labelRendererType
   */
  listTextFormat?: string;
  listTextFieldName?: string; // 默认 name
  listValueFieldName?: string; // 默认 id
  columns?: RapidTableColumnConfig[];
  dropdownMatchSelectWidth?: boolean | number;
  entityCode: string;
  requestParams?: RapidTableSelectRockConfig["requestConfig"]["params"];
  value?: string | string[];
  bordered?: boolean;
  onChange?(value: string): void;
  onSelectedRecord?(record: Record<string, any>, selectedRecords: Record<string, any>[]): void;

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
