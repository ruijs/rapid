import type { RockChildrenConfig, RockEventHandlerConfig, SimpleRockConfig, StoreConfig } from "@ruiapp/move-style";
import type { RapidEntityListConfig } from "../rapid-entity-list/rapid-entity-list-types";
import type { RapidEntityFormConfig } from "../rapid-entity-form/rapid-entity-form-types";
import { RapidEntitySearchFormConfig } from "../rapid-entity-search-form/rapid-entity-search-form-types";
import { IRapidEntityListToolboxConfig } from "../rapid-entity-list-toolbox/RapidEntityListToolbox";

export interface SonicEntityListConfig extends RapidEntityListConfig {
  newModalTitle?: string;
  newForm?: Partial<RapidEntityFormConfig>;
  editModalTitle?: string;
  editForm?: Partial<RapidEntityFormConfig>;
  searchForm?: Partial<RapidEntitySearchFormConfig>;
  footer?: RockChildrenConfig;
  stores?: StoreConfig[];
  toolbox?: IRapidEntityListToolboxConfig;
  actionSubscriptions?: SonicEntityListActionSubscriptionConfig[];
}

export interface SonicEntityListActionSubscriptionConfig {
  actionName: string;
  handlers: RockEventHandlerConfig;
}

export interface SonicEntityListRockConfig extends SimpleRockConfig, SonicEntityListConfig {}
