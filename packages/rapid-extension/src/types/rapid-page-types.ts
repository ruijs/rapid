import type { RockChildrenConfig, RockPageEventSubscriptionConfig, StoreConfig } from "@ruiapp/move-style";
import { RapidActionPermissionCheck } from "./rapid-assertion-types";

/**
 * Rapid页面
 */
export type RapidPage = {
  /**
   * 页面编码
   */
  code: string;

  /**
   * 父页面编码，用于导航展开和高亮
   */
  parentCode?: string;

  /**
   * 页面名称
   */
  name: string;

  /**
   * 页面标题
   */
  title?: string;

  stores?: StoreConfig[];

  /**
   * 视图配置
   */
  view?: RockChildrenConfig;

  eventSubscriptions?: RockPageEventSubscriptionConfig[];

  permissionCheck?: RapidActionPermissionCheck;
};
