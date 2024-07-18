import type { SimpleRockConfig } from "@ruiapp/move-style";
import type { UploadProps } from "antd";

export type RapidUploaderFormInputConfig = {
  buttonText?: string;

  uploadProps: UploadProps;

  multiple?: boolean;
};

export type RapidFileInfo = {
  key: string;
  name: string;
  size: number;
  type: string;
};

export interface RapidUploaderFormInputRockConfig extends SimpleRockConfig, RapidUploaderFormInputConfig {}
