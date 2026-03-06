import { Rock } from "@ruiapp/move-style";
import RichTextRendererMeta from "./RichTextRendererMeta";
import { RapidRichTextRendererProps, RichTextRendererRockConfig } from "./rich-text-renderer-types";
import { genRockRenderer } from "@ruiapp/react-renderer";
import { lazy } from "react";
import { ClientOnlySuspense } from "../../components";

const Editor = lazy(() => import("../rapid-rich-text-editor/Editor"));

import "./rich-text-renderer-style.css";

export function configRapidRichTextRenderer(config: RichTextRendererRockConfig): RichTextRendererRockConfig {
  return config;
}

export function RapidRichTextRenderer(props: RapidRichTextRendererProps) {
  const { value, style, className, height } = props;

  return (
    <ClientOnlySuspense>
      <Editor
        hideToolbar
        height="auto"
        mode="display"
        className={`rui-rich-text-renderer ${className || ""}`}
        editorConfig={{ readOnly: true, placeholder: " " }}
        value={value}
        style={{
          minHeight: 32,
          maxHeight: height || 360,
          ...style,
        }}
      />
    </ClientOnlySuspense>
  );
}

export default {
  Renderer: genRockRenderer(RichTextRendererMeta.$type, RapidRichTextRenderer, true),
  ...RichTextRendererMeta,
} as Rock<RichTextRendererRockConfig>;
