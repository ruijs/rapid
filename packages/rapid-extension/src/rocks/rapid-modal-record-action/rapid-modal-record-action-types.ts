import type { RockChildrenConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidTableActionProps } from "../rapid-table-action/rapid-table-action-types";

export interface RapidModalRecordActionConfig extends RapidTableActionProps {
  /**
   * 模态框的标题
   */
  modalTitle: string;

  modalBody: RockChildrenConfig;

  onModalOk: RockEventHandlerConfig;

  onModalCancel: RockEventHandlerConfig;

  modalWidth?: string;

  modalHeight?: string;
}

export interface RapidModalRecordActionRockConfig extends SimpleRockConfig, RapidModalRecordActionConfig {}
