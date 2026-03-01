import type { HttpRequestOptions, RockConfig, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidTableActionProps } from "../rapid-table-action/rapid-table-action-types";

export interface RapidFormModalRecordActionConfig extends RapidTableActionProps {
  /**
   * 模态框的标题
   */
  modalTitle: string;

  form: RockConfig;

  successMessage?: string;

  errorMessage?: string;

  /**
   * @deprecated 请使用 onSubmit
   */
  onFormSubmit?: RockEventHandlerConfig;

  onSubmit?: RockEventHandlerConfig;

  resetFormOnModalOpen?: boolean;
}

export interface RapidFormModalRecordActionRockConfig extends SimpleRockConfig, RapidFormModalRecordActionConfig {}
