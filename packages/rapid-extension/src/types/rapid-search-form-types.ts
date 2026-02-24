import type { EntityFilterArrayOperators, EntityFilterRangeOperators, EntityFilterRelationalOperators, EntityFilterSetOperators } from "@ruiapp/rapid-common";
import { FilterFieldConfig, RapidSearchFormItemConfig } from "../mod";

export type RapidSearchFormItemFilterMode =
  | EntityFilterRelationalOperators
  | EntityFilterArrayOperators
  | EntityFilterSetOperators
  | EntityFilterRangeOperators
  | "range" // deprecated, use between
  | "overlap";

export interface SearchFormFilterConfiguration extends RapidSearchFormItemConfig {
  /**
   * 变量名
   */
  code: string;

  /**
   * 过滤项额外配置
   */
  filterExtra?: FilterFieldConfig["extra"];
}
