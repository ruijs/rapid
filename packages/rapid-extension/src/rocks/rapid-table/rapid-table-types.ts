import { RockEventHandlerConfig, SimpleRockConfig, RockConfig } from "@ruiapp/move-style";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { RapidTableColumnRockConfig } from "../rapid-table-column/rapid-table-column-types";

export const RAPID_TABLE_ROCK_TYPE = "rapidTable" as const;

export type RapidTableProps = {
  size?: SizeType;
  height?: string | number;
  tableAutoHeight?: boolean;
  bordered?: boolean;
  showHeader?: boolean;
  rowKey?: string | ((record: any) => string);
  dataSource?: any[];
  columns: RapidTableColumnRockConfig[];
  pagination?: any;
  expandedRow?: RockConfig;
  onRowClick?: RockEventHandlerConfig;

  /**
   * 是否将列表转换成树结构
   */
  convertListToTree?: boolean;

  /**
   * dataSource 适配器， 遵循 rui expression 规范（解析）
   */
  dataSourceAdapter?: string;

  /**
   * 列表中的上级字段名。通常为`parent.id`或者`parentId`等。
   */
  listParentField?: string;

  listIdField?: string;
  treeChildrenField?: string;
  treeTopParentValue?: string | number;

  /**
   * 是否开启虚拟表格模式
   */
  virtual?: boolean;
};

export interface RapidTableRockConfig extends SimpleRockConfig, RapidTableProps {
  $type: typeof RAPID_TABLE_ROCK_TYPE;
}
