import type { SimpleRockConfig } from "@ruiapp/move-style";

export interface RapidMultilineTextRendererProps {
  value?: string | null;
  defaultText?: string;
}

export interface RapidMultilineTextRendererRockConfig extends SimpleRockConfig, RapidMultilineTextRendererProps {}
