import { ReactNode } from "react";
import { TableSelectorRockConfig } from "../table-selector/table-selector-types";

export interface TableSelectorColumn {
  code: string;
  title?: string;
  width?: number;
  fixed?: "left" | "right";
  format?: string;
  render?: string | ((record: any) => ReactNode);
}

export interface ModelTableSelectorRockConfig extends Omit<TableSelectorRockConfig, "requestConfig"> {
  entityCode: string;
  requestParams?: TableSelectorRockConfig["requestConfig"]["params"];
}
