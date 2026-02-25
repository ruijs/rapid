import { RockConfig, RockInstance, SimpleRockConfig } from "@ruiapp/move-style";

export interface RapidReferenceRendererProps extends RockInstance {
  value?: any;
  list?: Record<string, any>[];
  valueFieldName: string;
  textFieldName: string;
  itemRenderer?: RockConfig;
}

export interface RapidReferenceRendererRockConfig extends SimpleRockConfig, RapidReferenceRendererProps {}
