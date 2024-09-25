import { Rock } from "@ruiapp/move-style";
import RichTextDisplayMeta from "./RichTextRendererMeta";
import { RichTextRendererRockConfig } from "./rich-text-renderer-types";
import { merge, set } from "lodash";
import { CSSProperties } from "react";

export default {
  Renderer(context, props) {
    if (!props.value) {
      return <></>;
    }

    const style = merge<CSSProperties, CSSProperties>({ overflow: "auto", maxHeight: 360 }, props.style);

    return <div style={style} className={props.className} dangerouslySetInnerHTML={{ __html: props.value }}></div>;
  },

  ...RichTextDisplayMeta,
} as Rock<RichTextRendererRockConfig>;
