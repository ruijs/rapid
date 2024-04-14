import type { RockConfig, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidActionBase } from "../../types/rapid-action-types";
import { RapidFormItemType, RapidSearchFormItemConfig } from "../rapid-form-item/rapid-form-item-types";

export type SonicToolbarFormItemConfig = RapidActionBase & RapidSearchFormItemConfig & {
  label?: string;

  placeholder?: string;

  formItemType: RapidFormItemType;

  /**
   * 表单控件
   */
  formInput?: RockConfig;

  dataSourceCode?: string;
}

export interface SonicToolbarFormItemRockConfig extends SimpleRockConfig, SonicToolbarFormItemConfig {
}