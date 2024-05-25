import type { SimpleRockConfig } from "@ruiapp/move-style";


export interface RapidCheckboxListFormInputConfig {
  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * 值
   */
  value?: any;

  /**
   * 值的字段名
   */
  valueFieldName?: string;

  /**
   * 列表数据源编号
   */
  listDataSourceCode?: string;

  /**
   * 列表数据中表示值的字段名。默认为`id`。
   */
  listValueFieldName?: string;

  /**
   * 列表数据中作为文本展示的字段名。默认为`name`。
   */
  listTextFieldName?: string;

  /**
   * 文本展示的格式字符串。如果设置了此项，则忽略`listTextFieldName`设置。
   */
  listTextFormat?: string;

  /**
   * 用于分组的字段名。
   */
  groupByFieldName?: string;

  /**
   * 分组数据源编号
   */
  groupsDataSourceCode?: string;

  /**
   * 分组数据中表示值的字段名。默认为`id`。
   */
  groupValueFieldName?: string;

  /**
   * 分组数据中作为文本展示的字段名。默认为`name`。
   */
  groupTextFieldName?: string;
}

export type RapidCheckboxListFormInputRockConfig = SimpleRockConfig & RapidCheckboxListFormInputConfig;