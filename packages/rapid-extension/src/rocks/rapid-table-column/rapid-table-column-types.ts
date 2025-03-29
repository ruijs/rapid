import { RockChildrenConfig, RockI18nConfig, RockLocalesConfig, RockExpsConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidFieldType } from "../../types/rapid-entity-types";

/**
 * 表格字段列
 */
export type RapidTableColumnConfig = {
  type?: "auto" | "link";
  code: string;
  key?: string;

  fieldType?: RapidFieldType;

  /**
   * 获取value的字段名，默认为code。
   * 例如record为`{"name": "do sth.", "project": {"id":23, name: "RUI"}}`，此时设置`code`为`project`，`fieldName`为`project.name`，单元格将展示`RUI`。
   */
  fieldName?: string;

  /**
   * 列标题
   */
  title?: string;

  /**
   * 列描述
   */
  description?: string;

  /**
   * 对齐方式
   */
  align?: "left" | "center" | "right";

  /**
   * 固定位置
   */
  fixed?: "left" | "right";

  /**
   * 列宽
   */
  width?: string | number;

  /**
   * 最小列宽。适用于自适应宽度的列。
   */
  minWidth?: string | number;

  /**
   * 渲染器类型
   */
  rendererType?: string;

  /**
   * 渲染器属性
   */
  rendererProps?: Record<string, any>;

  /**
   * 使用引用数据作为value进行渲染
   */
  renderWithReference?: boolean;

  /**
   * 引用的实体编码
   */
  referenceEntityCode?: string;

  /**
   * 引用数据源
   */
  referenceDataSource?: string;

  /**
   * @deprecated use rendererType to customized rendering
   */
  render?: string | Function;

  /**
   * @deprecated use rapidObjectRenderer and set format in rendererProps
   */
  format?: string;

  cell?: RockChildrenConfig;

  $exps?: RockExpsConfig;

  $i18n?: RockI18nConfig;

  $locales?: RockLocalesConfig;

  children?: RapidTableColumnRockConfig[];

  /**
   * 汇总方式
   */
  summaryMethod?: "sum";

  /**
   * 汇总渲染器类型
   */
  summaryRendererType?: string;

  /**
   * 汇总渲染器属性
   */
  summaryRendererProps?: Record<string, any>;
};

export interface RapidTableColumnRockConfig extends SimpleRockConfig, RapidTableColumnConfig {}
