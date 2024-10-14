import { Rock } from "@ruiapp/move-style";
import RichTextDisplayMeta from "./RichTextRendererMeta";
import { RichTextRendererRockConfig } from "./rich-text-renderer-types";
import { lazy } from "react";
import { ClientOnlySuspense } from "../../components";

const Editor = lazy(() => import("../rapid-rich-text-editor/Editor"));

import "./rich-text-renderer-style.css";

export default {
  Renderer(context, props) {
    return (
      <ClientOnlySuspense>
        <Editor
          hideToolbar
          height={"auto"}
          className={`rui-rich-text-renderer ${props.className || ""}`}
          editorConfig={{ readOnly: true, placeholder: " " }}
          value={props.value}
          style={{
            minHeight: 32,
            maxHeight: props.height || 360,
            ...props.style,
          }}
        />
      </ClientOnlySuspense>
    );
  },

  ...RichTextDisplayMeta,
} as Rock<RichTextRendererRockConfig>;
