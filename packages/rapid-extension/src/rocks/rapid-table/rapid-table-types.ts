import { RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { SizeType } from "antd/lib/config-provider/SizeContext";
import { RapidTableColumnRockConfig } from "../rapid-table-column/rapid-table-column-types";

export type RapidTableConfig = {
  size: SizeType;
  height?: string | number;
  bordered: boolean;
  showHeader?: boolean;
  rowKey?: string;
  dataSource: any;
  columns: RapidTableColumnRockConfig[];
  onChange?: RockEventHandlerConfig;

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

  /**
   * 是否开启虚拟表格模式
   */
  virtual?: boolean;
};

export interface RapidTableRockConfig extends SimpleRockConfig, RapidTableConfig {}
