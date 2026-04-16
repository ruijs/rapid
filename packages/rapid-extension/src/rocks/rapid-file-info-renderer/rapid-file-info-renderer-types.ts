import { SimpleRockConfig } from "@ruiapp/move-style";
import { RapidFileInfo } from "../rapid-uploader-form-input/rapid-uploader-form-input-types";

export interface RapidFileInfoRendererRockConfig extends SimpleRockConfig {
  value: RapidFileInfo | RapidFileInfo[] | null | undefined;

  showFileSize?: boolean;

  fileSizeDecimalPlaces?: number;

  arrayRendererProps?: any;

  /**
   * 是否显示预览按钮
   * @default false
   */
  showPreview?: boolean;

  /**
   * 预览模态框标题
   * @default "文件预览"
   */
  previewModalTitle?: string;

  /**
   * 预览模态框宽度
   * @default 800
   */
  previewModalWidth?: number | string;

  /**
   * 预览模式 默认 auto
   * @example "auto" - 仅对支持的类型显示预览按钮（图片、PDF）
   * @example "all" - 对所有文件显示预览按钮
   */
  previewMode?: "auto" | "all";
}
