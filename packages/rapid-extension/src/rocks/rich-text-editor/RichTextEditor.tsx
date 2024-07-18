import { type Rock } from "@ruiapp/move-style";
import { lazy, memo, PropsWithChildren, useEffect, useState, Suspense } from "react";
import { RichTextEditorRockConfig } from "./rich-text-editor-types";
import { convertToEventHandlers } from "@ruiapp/react-renderer";
import RichTextEditorMeta from "./RichTextEditorMeta";

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

    return (
      <ClientOnly>
        <Suspense fallback={<div></div>}>
          <Editor
            value={props.value}
            disabled={props.disabled}
            placeholder={props.placeholder}
            height={props.height}
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
