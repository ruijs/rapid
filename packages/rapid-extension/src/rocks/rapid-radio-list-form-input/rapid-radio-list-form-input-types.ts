import type { SimpleRockConfig } from "@ruiapp/move-style";

export interface RapidRadioListFormInputConfig {
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
   * 单选框的排列方向
   */
  direction: "horizontal" | "vertical";
}

export type RapidRadioListFormInputRockConfig = SimpleRockConfig & RapidRadioListFormInputConfig;