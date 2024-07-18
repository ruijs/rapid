import { useState, useEffect, memo } from "react";
import { Editor, Toolbar } from "@wangeditor/editor-for-react";
import { IDomEditor, IEditorConfig, IToolbarConfig } from "@wangeditor/editor";

import "@wangeditor/editor/dist/css/style.css";
import "./rich-text-editor-style.css";

interface IProps {
  disabled?: boolean;
  height?: number | string;
  placeholder?: string;
  value?: string;
  onChange?(value: string): void;
}

const RapidEditor = memo<IProps>((props) => {
  const { height = 500 } = props;

  const [editor, setEditor] = useState<IDomEditor | null>(null);

  // 工具栏配置
  const toolbarConfig: Partial<IToolbarConfig> = {};

  // 编辑器配置
  const editorConfig: Partial<IEditorConfig> = {
    placeholder: props.placeholder,
    readOnly: props.disabled || false,
  };

  // 及时销毁 editor ，重要！
  useEffect(() => {
    return () => {
      if (editor == null) return;
      editor.destroy();
      setEditor(null);
    };
  }, [editor]);

  return (
    <div className="rui-rich-text-editor" style={{ height }}>
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
