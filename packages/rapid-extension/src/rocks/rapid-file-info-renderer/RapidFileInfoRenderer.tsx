import { MoveStyleUtils, Rock, RockChildrenConfig, RockConfig } from "@ruiapp/move-style";
import RapidFileInfoRendererMeta from "./RapidFileInfoRendererMeta";
import { RapidFileInfoRendererRockConfig } from "./rapid-file-info-renderer-types";
import { renderRock } from "@ruiapp/react-renderer";
import { isArray, isString, merge } from "lodash";
import { RapidFileInfo } from "../rapid-uploader-form-input/rapid-uploader-form-input-types";
import { formatFileSize } from "../../utils/format-utility";
import rapidAppDefinition from "../../rapidAppDefinition";

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
      return renderFileInfo(value, showFileSize, fileSizeDecimalPlaces);
    }
  },

  ...RapidFileInfoRendererMeta,
} as Rock;

function renderFileInfo(fileInfo: RapidFileInfo, showFileSize: boolean, fileSizeDecimalPlaces?: number) {
  const apiBaseUrl = rapidAppDefinition.getApiBaseUrl() || "/api";
  return (
    <>
      <a href={`${apiBaseUrl}/download/file?fileKey=${encodeURIComponent(fileInfo.key)}&fileName=${encodeURIComponent(fileInfo.name)}`}>
        {fileInfo.name.toString()}
      </a>
      {showFileSize ? ` (${formatFileSize(fileInfo.size, fileSizeDecimalPlaces)})` : ""}
    </>
  );
}
