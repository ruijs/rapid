import type { ContainerRockConfig, RockConfig, RockInstance, SimpleRockConfig } from "@ruiapp/move-style";
import type { ReactNode } from "react";

export interface RapidArrayRendererProps extends RockInstance {
  value?: any[] | null;
  defaultText?: string;
  format?: string;
  item?: (value: any, index: number) => ReactNode;
  separator?: () => ReactNode;
  noSeparator?: boolean;
  listContainer?: (children: ReactNode[]) => ReactNode;
  itemContainer?: (children: ReactNode, value: any, index: number) => ReactNode;
}

export interface RapidArrayRendererRockConfig
  extends SimpleRockConfig,
    Omit<RapidArrayRendererProps, "item" | "separator" | "listContainer" | "itemContainer"> {
  item?: RockConfig;
  separator?: RockConfig;
  listContainer?: ContainerRockConfig;
  itemContainer?: ContainerRockConfig;
}
