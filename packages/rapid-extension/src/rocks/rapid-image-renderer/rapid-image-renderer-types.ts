import { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidFileInfo } from "../rapid-uploader-form-input/rapid-uploader-form-input-types";

export interface RapidImageRendererRockConfig extends SimpleRockConfig {
  value: RapidFileInfo | RapidFileInfo[] | null | undefined;

  preview?: boolean;

  arrayRendererProps?: any;

  height?: number | string;
  width?: number | string;
  fallback?: string;
  alt?: string;
}
