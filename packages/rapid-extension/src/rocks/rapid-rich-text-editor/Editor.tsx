import { useState, useEffect, memo, useMemo } from "react";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { IDomEditor, IEditorConfig, IToolbarConfig, DomEditor } from "@wangeditor/editor";
import { merge } from "lodash";
import rapidApi from "../../rapidApi";

import "@wangeditor/editor/dist/css/style.css";
import "./rich-text-editor-style.css";

interface IProps {
  height?: number | string;
  toolbarConfig?: Partial<IToolbarConfig>;
  editorConfig?: Partial<IEditorConfig>;
  value?: string;
  onChange?(value: string): void;
}

const RapidEditor = memo<IProps>((props) => {
  const { height = 500 } = props;

  const [editor, setEditor] = useState<IDomEditor | null>(null);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = useMemo(
    () =>
      merge(
        {
          excludeKeys: ["insertVideo", "uploadVideo", "editVideoSize", "group-video"],
        },
        props.toolbarConfig || {},
      ),
    [props.toolbarConfig],
  );

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = useMemo(
    () =>
      merge(
        {
          placeholder: "请编辑...",
          readOnly: false,
          MENU_CONF: {
            uploadImage: {
              customUpload(file, insertFn) {
                return new Promise((resolve) => {
                  const formData = new FormData();
                  formData.append("file", file);
                  rapidApi
                    .post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } })
                    .then((res) => {
                      const data = res.data;
                      if (res.status >= 200 && res.status < 400) {
                        const url = `/api/download/file?inline=true&fileKey=${data.fileKey}&fileName=${file.name}`;
                        insertFn(url, file.name, url);
                        resolve("ok");
                      } else {
                        throw new Error(data?.message || res.statusText || "图片上传失败");
                      }
                    })
                    .catch((err) => {
                      const res = err.response;
                      throw new Error(res?.data?.message || res?.statusText || "图片上传失败");
                    });
                });
              },
            },
          },
        },
        props.editorConfig || {},
      ),
    [props.editorConfig],
  );

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div className="rui-rich-text-editor" style={{ height, zIndex: 100 }}>
      <Toolbar editor={editor} defaultConfig={toolbarConfig} mode="default" className="rui-rich-text-editor--toolbar" />
      <Editor
        defaultConfig={editorConfig}
        className="rui-rich-text-editor--body"
        value={props.value}
        onCreated={setEditor}
        onChange={(editor) => {
          props.onChange?.(editor.getHtml());
        }}
        mode="default"
      />
    </div>
  );
});

export default RapidEditor;
