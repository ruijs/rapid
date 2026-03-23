/**
 * 事件日志配置
 */
export type EventLogConfig =
  | {
      /**
       * 事件编码
       */
      eventTypeCode: string;
      /**
       * 事件名称
       */
      eventTypeName?: string;
      /**
       * 扩展属性
       */
      extend?: Record<string, any>;
    }
  | EventLogPropertyConfig;

export type EventLogPropertyConfig = {
  /**
   * 属性编码
   */
  propertyCode: string;
  /**
   * 目标ID属编码
   */
  targetIdPropertyCode?: string;
  /**
   * 事件类型
   */
  eventTypes?: EventLogEventType[];
  /**
   * 扩展属性
   */
  extend?: Record<string, any>;
};

export type EventLogEventType = {
  /**
   * 事件编码
   */
  eventTypeCode: string;
  /**
   * 事件名称
   */
  eventTypeName?: string;
  /**
   * 属性值
   */
  propertyValue: string;
};
