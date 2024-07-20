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
    const { value, preview } = props;
    if (!value) {
      return null;
    }

    if (isArray(value)) {
      const arrayRendererProps = merge(props.arrayRendererProps || {}, {
        item: {
          $type: "rapidImageRenderer",
          preview,
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
      });
    }
  },

  ...RapidFileInfoRendererMeta,
} as Rock;

export type RenderImageProps = {
  fileInfo: RapidFileInfo;
  preview: RapidImageRendererRockConfig["preview"];
};

function renderImage(props: RenderImageProps) {
  const { fileInfo, preview } = props;
  const downloadUrl = `/api/download/file?fileKey=${encodeURIComponent(fileInfo.key)}&fileName=${encodeURIComponent(fileInfo.name)}`;
  return <Image src={downloadUrl} preview={preview} />;
}
