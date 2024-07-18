import { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidFileInfo } from "../rapid-uploader-form-input/rapid-uploader-form-input-types";

export interface RapidFileInfoRendererRockConfig extends SimpleRockConfig {
  value: RapidFileInfo | RapidFileInfo[] | null | undefined;

  showFileSize?: boolean;

  fileSizeDecimalPlaces?: number;

  arrayRendererProps?: any;
}
