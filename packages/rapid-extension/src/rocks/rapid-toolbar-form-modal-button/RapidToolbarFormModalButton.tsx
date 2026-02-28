import { RockEventHandler, type Rock, type RockConfig, RockInstance, RockChildrenConfig } from "@ruiapp/move-style";
import { genRockRenderer, renderRock, renderRockChildren } from "@ruiapp/react-renderer";
import RapidToolbarFormModalButtonMeta from "./RapidToolbarFormModalButtonMeta";
import { RapidToolbarFormModalButtonProps, RapidToolbarFormModalButtonRockConfig } from "./rapid-toolbar-form-modal-button-types";
import { RapidFormRockConfig } from "../rapid-form/rapid-form-types";
import { getExtensionLocaleStringResource } from "../../helpers/i18nHelper";
import { Modal } from "antd";
import { useState } from "react";
import { RapidToolbarButton } from "../rapid-toolbar-button/RapidToolbarButton";
import { omit } from "lodash";

export function configRapidToolbarFormModalButton(config: RapidToolbarFormModalButtonRockConfig): RapidToolbarFormModalButtonRockConfig {
  return config;
}

export function RapidToolbarFormModalButton(props: RapidToolbarFormModalButtonProps) {
  const { $id, _context: context } = props as any as RockInstance;
  const { framework, page } = context;
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  const handleOpen = async () => {
    if (props.onAction) {
      await props.onAction();
    }
    setModalOpen(true);
    if (props.onModalOpen) {
      await props.onModalOpen();
    }
  };

  const handleCancel = async () => {
    if (props.onModalCancel) {
      await props.onModalCancel();
    }
    setModalOpen(false);
  };

  const formRockId = `${$id}-form`;

  const handleOk = async () => {
    if (props.onModalOk) {
      await props.onModalOk();
    }
    page.sendComponentMessage(formRockId, { name: "submit" });
  };

  let modalBody: RockChildrenConfig | null = null;
  if (props.form) {
    const formRockConfig: RapidFormRockConfig = {
      $id: formRockId,
      ...(props.form as RapidFormRockConfig),
      beforeSubmit: [
        {
          $action: "script",
          script: () => {
            setModalSaving(true);
          },
        },
        ...((props.form.beforeSubmit as RockEventHandler[]) || []),
      ],
      onSubmitSuccess: [
        {
          $action: "script",
          script: () => {
            setModalSaving(false);
            setModalOpen(false);
          },
        },
        ...(((props.form.onSubmitSuccess || props.form.onSaveSuccess) as RockEventHandler[]) || []),
        ...(((props.onSubmitSuccess || props.onSaveSuccess) as RockEventHandler[]) || []),
      ],
      onSubmitError: [
        {
          $action: "script",
          script: () => {
            setModalSaving(false);
          },
        },
        ...(((props.form.onSubmitError || props.form.onSaveError) as RockEventHandler[]) || []),
        ...(((props.onSubmitError || props.onSaveError) as RockEventHandler[]) || []),
      ],
    };
    modalBody = formRockConfig;
  } else {
    modalBody = props.modalBody || [];
  }

  const btnProps = omit(props, ["$id", "_state", "_scope", "_initialized", "onModalOpen", "onModalOk", "onModalCancel"]);

  return (
    <>
      <RapidToolbarButton {...btnProps} onAction={handleOpen} />
      <Modal
        title={props.modalTitle || props.text}
        open={modalOpen}
        confirmLoading={modalSaving}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={getExtensionLocaleStringResource(framework, "ok")}
        cancelText={getExtensionLocaleStringResource(framework, "cancel")}
        destroyOnClose={true}
        maskClosable={false}
      >
        {renderRockChildren({ context, rockChildrenConfig: modalBody })}
      </Modal>
    </>
  );
}

export default {
  Renderer: genRockRenderer(RapidToolbarFormModalButtonMeta.$type, RapidToolbarFormModalButton),
  ...RapidToolbarFormModalButtonMeta,
} as Rock<RapidToolbarFormModalButtonRockConfig>;
