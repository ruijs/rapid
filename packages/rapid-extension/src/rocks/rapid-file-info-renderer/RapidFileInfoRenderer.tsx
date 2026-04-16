import { MoveStyleUtils, Rock, RockChildrenConfig, RockConfig } from "@ruiapp/move-style";
import RapidFileInfoRendererMeta from "./RapidFileInfoRendererMeta";
import type { RapidFileInfoRendererRockConfig } from "./rapid-file-info-renderer-types";
import { renderRock } from "@ruiapp/react-renderer";
import { isArray, isString, merge } from "lodash";
import { RapidFileInfo } from "../rapid-uploader-form-input/rapid-uploader-form-input-types";
import { formatFileSize } from "../../utils/format-utility";
import rapidAppDefinition from "../../rapidAppDefinition";

import { Button, Image, Modal, Space, message } from "antd";
import { useState } from "react";
import { EyeOutlined, FilePdfOutlined, FileExcelOutlined, FileWordOutlined, FilePptOutlined, FileImageOutlined } from "@ant-design/icons";

export default {
  $type: "rapidFileInfoRenderer",

  Renderer(context, props: RapidFileInfoRendererRockConfig) {
    const { value, showFileSize, fileSizeDecimalPlaces } = props;
    if (!value) {
      return null;
    }

    if (isArray(value)) {
      const arrayRendererProps = merge(props.arrayRendererProps || {}, {
        item: {
          $type: "rapidFileInfoRenderer",
          showFileSize,
          fileSizeDecimalPlaces,
          showPreview: props.showPreview,
          previewModalTitle: props.previewModalTitle,
          previewModalWidth: props.previewModalWidth,
          useBuiltInPreviewer: props.useBuiltInPreviewer,
          previewMode: props.previewMode,
        },
        itemContainer: {
          $type: "box",
        },
        noSeparator: true,
      });

      return renderRock({
        context,
        rockConfig: {
          $type: "rapidArrayRenderer",
          ...arrayRendererProps,
          value,
        },
      });
    } else {
      return renderFileInfo(value, showFileSize, fileSizeDecimalPlaces, props);
    }
  },

  ...RapidFileInfoRendererMeta,
} as Rock;

function renderFileInfo(
  fileInfo: RapidFileInfo,
  showFileSize: boolean | undefined,
  fileSizeDecimalPlaces: number | undefined,
  props?: RapidFileInfoRendererRockConfig,
) {
  const apiBaseUrl = rapidAppDefinition.getApiBaseUrl();
  const downloadUrl = `${apiBaseUrl}/download/file?fileKey=${encodeURIComponent(fileInfo.key)}&fileName=${encodeURIComponent(fileInfo.name)}`;

  // Determine file type for icon selection
  const fileExt = fileInfo.name.split(".").pop()?.toLowerCase() || "";
  const isImage = ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(fileExt);
  const isPdf = fileExt === "pdf";
  const isExcel = ["xls", "xlsx"].includes(fileExt);
  const isWord = ["doc", "docx"].includes(fileExt);
  const isPpt = ["ppt", "pptx"].includes(fileExt);

  // Get appropriate icon
  const getIcon = () => {
    if (isImage) return <FileImageOutlined onPointerOverCapture={undefined} onPointerOutCapture={undefined} />;
    if (isPdf) return <FilePdfOutlined onPointerOverCapture={undefined} onPointerOutCapture={undefined} />;
    if (isExcel) return <FileExcelOutlined onPointerOverCapture={undefined} onPointerOutCapture={undefined} />;
    if (isWord) return <FileWordOutlined onPointerOverCapture={undefined} onPointerOutCapture={undefined} />;
    if (isPpt) return <FilePptOutlined onPointerOverCapture={undefined} onPointerOutCapture={undefined} />;
    return <FileImageOutlined onPointerOverCapture={undefined} onPointerOutCapture={undefined} />;
  };

  // Determine if preview should be shown based on previewMode
  const previewMode = props?.previewMode || "auto";
  let canPreview = false;
  if (props?.showPreview) {
    if (previewMode === "auto") {
      canPreview = isImage || isPdf;
    } else if (previewMode === "all") {
      canPreview = true;
    } else {
      canPreview = false;
    }
  }

  return (
    <FileItemWithPreview
      fileInfo={fileInfo}
      downloadUrl={downloadUrl}
      showFileSize={showFileSize}
      fileSizeDecimalPlaces={fileSizeDecimalPlaces}
      canPreview={canPreview}
      isImage={isImage}
      isPdf={isPdf}
      icon={getIcon()}
      {...props}
    />
  );
}

interface FileItemWithPreviewProps {
  fileInfo: RapidFileInfo;
  downloadUrl: string;
  showFileSize?: boolean;
  fileSizeDecimalPlaces?: number;
  canPreview: boolean;
  isImage: boolean;
  isPdf: boolean;
  icon: React.ReactNode;
  showPreview?: boolean;
  previewModalTitle?: string;
  previewModalWidth?: number | string;
  useBuiltInPreviewer?: boolean;
  previewMode?: "auto" | "all";
}

function FileItemWithPreview(props: FileItemWithPreviewProps) {
  const {
    fileInfo,
    downloadUrl,
    showFileSize,
    fileSizeDecimalPlaces,
    canPreview = true,
    isImage,
    isPdf,
    icon,
    previewModalTitle = "文件预览",
    previewModalWidth = 1200,
  } = props;

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handlePreview = () => {
    setPreviewVisible(true);
  };

  const getPreviewContent = () => {
    const apiBaseUrl = rapidAppDefinition.getApiBaseUrl();
    const previewUrl = `${apiBaseUrl}/download/file?fileKey=${encodeURIComponent(fileInfo.key)}&fileName=${encodeURIComponent(fileInfo.name)}&inline=true`;

    if (isImage) {
      return (
        <div style={{ textAlign: "center" }}>
          <Image src={previewUrl} alt={fileInfo.name} style={{ maxWidth: "100%", maxHeight: "70vh" }} preview={false} />
        </div>
      );
    }

    if (isPdf) {
      return (
        <div style={{ textAlign: "center" }}>
          <iframe src={previewUrl} width="100%" height="600vh" style={{ border: "none" }} title={fileInfo.name} />
        </div>
      );
    }

    // For other file types or if built-in previewer is disabled
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <Space direction="vertical" size="large">
          <div style={{ fontSize: "48px" }}>{icon}</div>
          <div>
            <div style={{ fontSize: "16px", marginBottom: "8px" }}>{fileInfo.name}</div>
            <div style={{ color: "#999", fontSize: "14px" }}>此文件类型不支持在线预览</div>
          </div>
          <Button type="primary" href={downloadUrl} target="_blank">
            下载文件
          </Button>
        </Space>
      </div>
    );
  };

  return (
    <>
      <Space>
        <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
          {fileInfo.name.toString()}
        </a>
        {showFileSize ? <span style={{ color: "#999", fontSize: "12px" }}>({formatFileSize(fileInfo.size, fileSizeDecimalPlaces)})</span> : null}
        {canPreview && (
          <Button type="link" icon={<EyeOutlined onPointerOverCapture={undefined} onPointerOutCapture={undefined} />} onClick={handlePreview}></Button>
        )}
      </Space>

      <Modal title={previewModalTitle} open={previewVisible} onCancel={() => setPreviewVisible(false)} footer={null} width={previewModalWidth} destroyOnClose>
        {previewLoading && <div style={{ textAlign: "center", padding: "40px" }}>loading...</div>}
        {!previewLoading && getPreviewContent()}
      </Modal>
    </>
  );
}
