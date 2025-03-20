import type { RockConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidTableActionConfig } from "../rapid-table-action/rapid-table-action-types";

export interface RapidFormModalRecordActionConfig extends RapidTableActionConfig {
  /**
   * 模态框的标题
   */
  modalTitle: string;

  form: RockConfig;

  successMessage?: string;

  errorMessage?: string;

  onFormSubmit: RockEventHandlerConfig;
}

export interface RapidFormModalRecordActionRockConfig extends SimpleRockConfig, RapidFormModalRecordActionConfig {}
