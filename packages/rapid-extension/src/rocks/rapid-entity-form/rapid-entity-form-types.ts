import type { ContainerRockConfig, RockEventHandlerConfig } from "@ruiapp/move-style";
import { RapidFormConfig } from "../rapid-form/rapid-form-types";
import { FindEntityFindRelationEntitiesOptions } from "../../types/rapid-entity-types";
import { RockEventHandlerSaveRapidEntity } from "../../event-actions/save-rapid-entity";

export interface RapidEntityFormConfig extends RapidFormConfig {
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
   * 表单固定字段，用于数据提交
   */
  fixedFields?: Record<string, any>;

  /**
   * 表单默认字段，可用于新建表单设置默认值
   */
  defaultFormFields?: Record<string, any>;

  onFormSubmit?: RockEventHandlerConfig;

  onFormRefresh?: RockEventHandlerConfig;

  onValuesChange?: RockEventHandlerConfig;

  onSaveSuccess?: RockEventHandlerConfig;

  onSaveError?: RockEventHandlerConfig;

  /**
   * @deprecated
   * 使用 `submitMethod` 和 `submitUrl` 替代
   */
  customRequest?: RockEventHandlerSaveRapidEntity["customRequest"];

  submitMethod?: RockEventHandlerSaveRapidEntity["customRequest"]["method"];

  submitUrl?: RockEventHandlerSaveRapidEntity["customRequest"]["url"];
}

export interface RapidEntityFormRockConfig extends ContainerRockConfig, RapidEntityFormConfig {}
