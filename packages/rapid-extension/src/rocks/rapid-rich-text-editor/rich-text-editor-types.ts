import { SimpleRockConfig } from "@ruiapp/move-style";

export interface RichTextEditorRockConfig extends SimpleRockConfig {
  disabled?: boolean;
  height?: number | string;
  placeholder?: string;
  value?: string;
  onChange?(value: string): void;
}
