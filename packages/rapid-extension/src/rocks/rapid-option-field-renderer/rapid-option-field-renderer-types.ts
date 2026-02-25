import type { RockInstance, SimpleRockConfig } from "@ruiapp/move-style";
import type { ReactNode } from "react";

export interface RapidOptionFieldRendererProps extends RockInstance {
  dictionaryCode: string;
  value?: any;
  item?: (value: any, index: number) => ReactNode;
  separator?: () => ReactNode;
  noSeparator?: boolean;
  listContainer?: (children: ReactNode[]) => ReactNode;
  itemContainer?: (children: ReactNode, value: any, index: number) => ReactNode;
}

// 保留旧类型名以兼容现有代码
export type RapidOptionFieldRendererConfig = {
  dictionaryCode: string;
  value?: any;
  item?: (value: any, index: number) => ReactNode;
  separator?: () => ReactNode;
  noSeparator?: boolean;
  listContainer?: (children: ReactNode[]) => ReactNode;
  itemContainer?: (children: ReactNode, value: any, index: number) => ReactNode;
};

export interface RapidOptionFieldRendererRockConfig
  extends SimpleRockConfig,
    Omit<RapidOptionFieldRendererProps, "item" | "separator" | "listContainer" | "itemContainer"> {
  item?: SimpleRockConfig;
  separator?: SimpleRockConfig;
  listContainer?: SimpleRockConfig;
  itemContainer?: SimpleRockConfig;
}
