import { type Rock } from "@ruiapp/move-style";
import { lazy, memo, PropsWithChildren, useEffect, useState, Suspense, useMemo } from "react";
import { RichTextEditorRockConfig } from "./rich-text-editor-types";
import { convertToEventHandlers } from "@ruiapp/react-renderer";
import RichTextEditorMeta from "./RichTextEditorMeta";
import { Spin } from "antd";

const Editor = lazy(() => import("./Editor"));

const ClientOnly = memo<PropsWithChildren>((props) => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <>{props.children}</> : <></>;
});

export default {
  Renderer(context, props) {
    const eventHandlers = convertToEventHandlers({ context, rockConfig: props }) as any;

    const editorConfig = useMemo(
      () => ({
        readOnly: props.disabled,
        placeholder: props.placeholder,
      }),
      [props.disabled, props.placeholder],
    );

    return (
      <ClientOnly>
        <Suspense fallback={<Spin />}>
          <Editor
            height={props.height}
            editorConfig={editorConfig}
            value={props.value}
            onChange={(v) => {
              eventHandlers.onChange?.(v);
            }}
          />
        </Suspense>
      </ClientOnly>
    );
  },

  ...RichTextEditorMeta,
} as Rock<RichTextEditorRockConfig>;
