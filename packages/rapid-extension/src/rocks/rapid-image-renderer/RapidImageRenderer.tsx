import { Rock } from "@ruiapp/move-style";
import RapidImageRendererMeta from "./RapidImageRendererMeta";
import { RapidImageRendererProps, RapidImageRendererRockConfig, RAPID_IMAGE_RENDERER_ROCK_TYPE } from "./rapid-image-renderer-types";
import { genRockRenderer } from "@ruiapp/react-renderer";
import { isArray } from "lodash";
import { Image } from "antd";
import rapidAppDefinition from "../../rapidAppDefinition";

export function configRapidImageRenderer(config: RapidImageRendererRockConfig): RapidImageRendererRockConfig {
  return config;
}

export function RapidImageRenderer(props: RapidImageRendererProps) {
  const { value, preview, height, width, fallback, alt, style, className } = props;

  if (!value) {
    return null;
  }

  if (isArray(value)) {
    return (
      <div className={className} style={{ display: "flex", gap: "8px", flexWrap: "wrap", ...style }}>
        {value.map((fileInfo, index) => (
          <RapidImageRenderer key={fileInfo.key || index} value={fileInfo} preview={preview} height={height} width={width} fallback={fallback} alt={alt} />
        ))}
      </div>
    );
  }

  const fileInfo = value;
  const apiBaseUrl = rapidAppDefinition.getApiBaseUrl();
  const downloadUrl = `${apiBaseUrl}/download/file?fileKey=${encodeURIComponent(fileInfo.key)}&fileName=${encodeURIComponent(fileInfo.name)}`;

  return <Image className={className} style={style} src={downloadUrl} preview={preview} height={height} width={width} fallback={fallback} alt={alt} />;
}

export default {
  Renderer: genRockRenderer(RAPID_IMAGE_RENDERER_ROCK_TYPE, RapidImageRenderer),
  ...RapidImageRendererMeta,
} as Rock<RapidImageRendererRockConfig>;
