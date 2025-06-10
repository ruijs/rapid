import type { RockChildrenConfig, RockConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface RapidToolbarFormModalButtonConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
  /**
   * 模态框的标题
   */
  modalTitle: string;

  modalBody?: RockChildrenConfig;

  form: RockConfig;

  onModalOpen: RockEventHandlerConfig;

  onModalOk: RockEventHandlerConfig;

  onModalCancel: RockEventHandlerConfig;

  onSaveSuccess: RockEventHandlerConfig;

  onSaveError: RockEventHandlerConfig;
}

export interface RapidToolbarFormModalButtonRockConfig extends SimpleRockConfig, RapidToolbarFormModalButtonConfig {}
