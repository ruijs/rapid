import { SimpleRockConfig } from "@ruiapp/move-style";

export interface RapidTextRendererProps {
  value: string | Record<string, any> | null | undefined;
  defaultText?: string;
  format?: string;
}

export interface RapidTextRendererRockConfig extends SimpleRockConfig, RapidTextRendererProps {}
