import { MoveStyleUtils, Rock, RockConfig, RockEvent, RockEventHandlerScript, handleComponentEvent } from "@ruiapp/move-style";
import RapidToolbarLinkMeta from "./RapidJsonFormInputMeta";
import { RapidJsonFormInputRockConfig } from "./rapid-json-form-input-types";
import { Button, Upload, UploadProps } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useCallback, useRef, useState } from "react";
import { renderRockChildren } from "@ruiapp/react-renderer";

export default {
  $type: "rapidJsonFormInput",

  Renderer(context, props) {
    const { logger, framework, page, scope } = context;
    const { $id, value, onChange } = props;

    const cmdsEditor = useRef<{
      getCodeContent(): string;
      setCodeContent(codeContent: string);
    }>();
    const [codeEditorVisible, setCodeEditorVisible] = useState(false);

    const onBtnEditClick: RockEventHandlerScript["script"] = async (event: RockEvent) => {
      setCodeEditorVisible(true);
      await MoveStyleUtils.waitVariable("current", cmdsEditor);
      cmdsEditor.current.setCodeContent((value && JSON.stringify(value, null, 4)) || "");
    };

    const onModalOk: RockEventHandlerScript["script"] = (event: RockEvent) => {
      let codeContent = cmdsEditor.current.getCodeContent();
      let value: any;
      if (codeContent) {
        codeContent = codeContent.trim();
      }
      if (codeContent) {
        try {
          value = JSON.parse(codeContent);
        } catch (ex) {
          logger.error(props, "Invalid JSON string.", { error: ex });
        }
      } else {
        value = null;
      }

      setCodeEditorVisible(false);
      handleComponentEvent("onChange", framework, page, scope, props, onChange, [value]);
    };

    const onModalCancel: RockEventHandlerScript["script"] = (event: RockEvent) => {
      setCodeEditorVisible(false);
    };

    const rockChildrenConfig: RockConfig[] = [
      {
        $id: `${$id}-internal`,
        $type: "htmlElement",
        htmlTag: "a",
        children: [
          {
            $id: `${$id}-edit-btn`,
            $type: "text",
            text: "Edit",
          },
        ],
        onClick: {
          $action: "script",
          script: onBtnEditClick,
        },
      },
      {
        $id: `${$id}-editor-modal`,
        $type: "antdModal",
        title: "Edit code",
        open: codeEditorVisible,
        width: "800px",
        height: "500px",
        children: [
          {
            $id: `${$id}-editor`,
            $type: "monacoEditor",
            cmds: cmdsEditor,
            width: "100%",
            height: "500px",
            language: "json",
          },
        ],
        onOk: {
          $action: "script",
          script: onModalOk,
        },
        onCancel: {
          $action: "script",
          script: onModalCancel,
        },
      },
    ];

    return renderRockChildren({ context, rockChildrenConfig });
  },

  ...RapidToolbarLinkMeta,
} as Rock<RapidJsonFormInputRockConfig>;
