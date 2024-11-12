import { Rock } from "@ruiapp/move-style";
import RapidFileInfoRendererMeta from "./RapidImageRendererMeta";
import { RapidImageRendererRockConfig } from "./rapid-image-renderer-types";
import { renderRock } from "@ruiapp/react-renderer";
import { isArray, merge } from "lodash";
import { RapidFileInfo } from "../rapid-uploader-form-input/rapid-uploader-form-input-types";
import { Image } from "antd";

export default {
  $type: "rapidImageRenderer",

  Renderer(context, props: RapidImageRendererRockConfig) {
    const { value, preview, height, width, fallback, alt } = props;
    if (!value) {
      return null;
    }

    if (isArray(value)) {
      const arrayRendererProps = merge(props.arrayRendererProps || {}, {
        item: {
          $type: "rapidImageRenderer",
          preview,
          width,
          height,
          fallback,
          alt,
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
      return renderImage({
        fileInfo: value,
        preview,
        width,
        height,
        fallback,
        alt,
      });
    }
  },

  ...RapidFileInfoRendererMeta,
} as Rock;

export type RenderImageProps = {
  fileInfo: RapidFileInfo;
} & Pick<RapidImageRendererRockConfig, "preview" | "height" | "width" | "fallback" | "alt">;

function renderImage(props: RenderImageProps) {
  const { fileInfo, preview, height, width, fallback, alt } = props;
  const downloadUrl = `/api/download/file?fileKey=${encodeURIComponent(fileInfo.key)}&fileName=${encodeURIComponent(fileInfo.name)}`;
  return <Image src={downloadUrl} preview={preview} height={height} width={width} fallback={fallback} alt={alt} />;
}
