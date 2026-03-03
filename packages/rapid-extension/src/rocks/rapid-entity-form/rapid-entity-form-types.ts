import type { SimpleRockConfig, RockEventHandlerConfig } from "@ruiapp/move-style";
import { RapidFormProps } from "../rapid-form/rapid-form-types";
import { FindEntityFindRelationEntitiesOptions } from "@ruiapp/rapid-common";
import { RockEventHandlerSaveRapidEntity } from "../../event-actions/save-rapid-entity";

export const RAPID_ENTITY_FORM_ROCK_TYPE = "rapidEntityForm" as const;

export interface RapidEntityFormProps extends RapidFormProps {
  mode?: "view" | "edit" | "new";

  entityCode: string;

  entityId?: string | number;

  lazyLoadData?: boolean;

  /**
   * 指定数据查询的属性。如果指定了`queryProperties`，则不会自动从`items`和`extraProperties`中提取查询属性。
   */
  queryProperties?: string[];

  /**
   * 数据查询时需要查询的额外属性。
   */
  extraProperties?: string[];

  /**
   * 查询关联对象的设置
   */
  relations?: Record<string, FindEntityFindRelationEntitiesOptions>;

  /**
   * @deprecated 请使用 onSubmitSuccess
   */
  onSaveSuccess?: RockEventHandlerConfig;

  /**
   * @deprecated 请使用 onSubmitError
   */
  onSaveError?: RockEventHandlerConfig;

  /**
   * @deprecated
   * 使用 `submitMethod` 和 `submitUrl` 替代
   */
  customRequest?: RockEventHandlerSaveRapidEntity["customRequest"];
}

export interface RapidEntityFormRockConfig extends SimpleRockConfig, RapidEntityFormProps {
  $type: typeof RAPID_ENTITY_FORM_ROCK_TYPE;
}
