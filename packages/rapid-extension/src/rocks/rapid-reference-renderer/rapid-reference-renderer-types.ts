import { RockConfig, RockInstance, SimpleRockConfig } from "@ruiapp/move-style";
import { ReactNode } from "react";

export interface RapidReferenceRendererProps extends RockInstance {
  value?: any;
  list?: Record<string, any>[];
  valueFieldName: string;
  textFieldName: string;
  itemRenderer?: (value: any) => ReactNode;
}

export interface RapidReferenceRendererRockConfig extends SimpleRockConfig, Omit<RapidReferenceRendererProps, "itemRenderer"> {
  itemRenderer?: RockConfig;
}
