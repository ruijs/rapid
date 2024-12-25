import { SimpleRockConfig } from "@ruiapp/move-style";
import { CSSProperties } from "react";

export interface RapidSecretTextRendererProps extends SimpleRockConfig {
  value: string | null | undefined;
  canViewOrigin?: boolean;
  canCopy?: boolean;
  style?: CSSProperties;
  iconStyle?: CSSProperties;
  tooltipShowOrigin?: string;
  tooltipHideOrigin?: string;
  tooltipCopy?: string;
  messageCopySuccess?: string;
}
