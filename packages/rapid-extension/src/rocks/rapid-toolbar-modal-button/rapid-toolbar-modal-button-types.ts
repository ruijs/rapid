import type { RockChildrenConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface RapidToolbarModalButtonConfig extends Omit<RapidToolbarButtonProps, "actionEventName"> {
  /**
   * 模态框的标题
   */
  modalTitle: string;

  modalBody: RockChildrenConfig;

  onModalOpen: RockEventHandlerConfig;

  onModalOk: RockEventHandlerConfig;

  onModalCancel: RockEventHandlerConfig;
}

export interface RapidToolbarModalButtonRockConfig extends SimpleRockConfig, RapidToolbarModalButtonConfig {}
