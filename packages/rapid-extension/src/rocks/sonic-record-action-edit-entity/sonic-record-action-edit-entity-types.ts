import type { RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarButtonConfig } from "../rapid-toolbar-button/rapid-toolbar-button-types";
import { RapidEntityFormConfig } from "../rapid-entity-form/rapid-entity-form-types";

export interface SonicRecordActionEditEntityConfig extends Omit<RapidToolbarButtonConfig, "actionEventName"> {
  /**
   * 模态框的标题。
   */
  modalTitle?: string;

  form?: Partial<RapidEntityFormConfig>;

  successMessage?: string;

  errorMessage?: string;
}

export interface SonicRecordActionEditEntityRockConfig extends SimpleRockConfig, SonicRecordActionEditEntityConfig {}
