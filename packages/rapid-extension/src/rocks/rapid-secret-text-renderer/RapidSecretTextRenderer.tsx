import { Rock } from "@ruiapp/move-style";
import RapidBoolRendererMeta from "./RapidSecretTextRendererMeta";
import { useState } from "react";
import { CopyOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Space, Tooltip } from "antd";
import { RapidSecretTextRendererProps } from "./rapid-secret-text-renderer-types";
import { message } from "antd";
import { copyToClipboard } from "../../utils/clipboard-utility";

function obfuscateText(text: string): string {
  // 如果文本长度小于等于6，全部替换成星号
  if (text.length <= 6) {
    return "******";
  }

  // 保留首尾各3个字符，中间部分用6个星号替换
  const start = text.slice(0, 3);
  const end = text.slice(-3);
  const obfuscatedPart = "******";

  return `${start}${obfuscatedPart}${end}`;
}

export default {
  $type: "rapidSecretTextRenderer",

  Renderer(context, props: RapidSecretTextRendererProps) {
    const { framework } = context;
    const { style, iconStyle, value, canViewOrigin, canCopy, messageCopySuccess } = props;

    const [isOriginMode, setIsOriginMode] = useState(false);

    const tooltipShowOrigin = props.tooltipShowOrigin || "Show";
    const tooltipHideOrigin = props.tooltipHideOrigin || "Hide";
    const tooltipCopy = props.tooltipCopy || "Copy";

    const handleTextCopy = async () => {
      await copyToClipboard(value);
      message.success(messageCopySuccess || "Text copied.");
    };

    return (
      <div style={style}>
        <Space>
          {isOriginMode ? value || "" : obfuscateText(value || "")}
          {canViewOrigin && !isOriginMode ? (
            <Tooltip title={tooltipShowOrigin}>
              <EyeOutlined style={iconStyle} onClick={() => setIsOriginMode(true)} />
            </Tooltip>
          ) : null}
          {canViewOrigin && isOriginMode ? (
            <Tooltip title={tooltipHideOrigin}>
              <EyeInvisibleOutlined style={iconStyle} onClick={() => setIsOriginMode(false)} />
            </Tooltip>
          ) : null}
          {canCopy ? (
            <Tooltip title={tooltipCopy}>
              <CopyOutlined style={iconStyle} onClick={handleTextCopy} />
            </Tooltip>
          ) : null}
        </Space>
      </div>
    );
  },

  ...RapidBoolRendererMeta,
} as Rock;
