import { Rock } from "@ruiapp/move-style";
import RichTextDisplayMeta from "./RichTextRendererMeta";
import { RichTextRendererRockConfig } from "./rich-text-renderer-types";

export default {
  Renderer(context, props) {
    if (!props.value) {
      return <></>;
    }

    return <div dangerouslySetInnerHTML={{ __html: props.value }}></div>;
  },

  ...RichTextDisplayMeta,
} as Rock<RichTextRendererRockConfig>;
