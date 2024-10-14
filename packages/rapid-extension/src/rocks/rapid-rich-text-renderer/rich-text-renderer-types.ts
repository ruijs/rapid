import { SimpleRockConfig } from "@ruiapp/move-style";
import { CSSProperties } from "react";

export interface RichTextRendererRockConfig extends SimpleRockConfig {
  value?: string;
  style?: CSSProperties;
  className?: string;
  height?: number | string;
}
