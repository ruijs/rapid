import { type Rock } from "@ruiapp/move-style";
import { lazy, useMemo } from "react";
import { RichTextEditorRockConfig } from "./rich-text-editor-types";
import { convertToEventHandlers } from "@ruiapp/react-renderer";
import RichTextEditorMeta from "./RichTextEditorMeta";
import { ClientOnlySuspense } from "../../components";

const Editor = lazy(() => import("./Editor"));

export default {
  Renderer(context, props) {
    const eventHandlers = convertToEventHandlers({ context, rockConfig: props }) as any;

    const editorConfig = useMemo(
      () => ({
        readOnly: props.disabled,
        placeholder: props.disabled ? " " : props.placeholder,
      }),
      [props.disabled, props.placeholder],
    );

    return (
      <ClientOnlySuspense>
        <Editor
          height={props.height}
          editorConfig={editorConfig}
          value={props.value}
          onChange={(v) => {
            eventHandlers.onChange?.(v);
          }}
        />
      </ClientOnlySuspense>
    );
  },

  ...RichTextEditorMeta,
} as Rock<RichTextEditorRockConfig>;
