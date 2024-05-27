import type { RockChildrenConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidTableActionConfig } from "../rapid-table-action/rapid-table-action-types";

export interface RapidModalRecordActionConfig extends RapidTableActionConfig {
  /**
   * 模态框的标题
   */
  modalTitle: string;

  modalBody: RockChildrenConfig;

  onModalOk: RockEventHandlerConfig;

  onModalCancel: RockEventHandlerConfig;
}

export interface RapidModalRecordActionRockConfig extends SimpleRockConfig, RapidModalRecordActionConfig {
}