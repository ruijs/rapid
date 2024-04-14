import type { RockChildrenConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export interface RapidToolbarFormModalButtonConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
  /**
   * 模态框的标题
   */
  modalTitle: string;

  modalBody: RockChildrenConfig;

  onModalOk: RockEventHandlerConfig;

  onModalCancel: RockEventHandlerConfig;
}

export interface RapidToolbarFormModalButtonRockConfig extends SimpleRockConfig, RapidToolbarFormModalButtonConfig {
}