import { RockInstance, SimpleRockConfig } from "@ruiapp/move-style";
import { CSSProperties } from "react";

export interface RapidRichTextRendererProps {
  value?: string;
  style?: CSSProperties;
  className?: string;
  height?: number | string;
}

export interface RichTextRendererRockConfig extends SimpleRockConfig, RapidRichTextRendererProps {}
