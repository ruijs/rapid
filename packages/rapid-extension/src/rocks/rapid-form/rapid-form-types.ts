import { ContainerRockConfig, RockEventHandlerConfig, RockExpsConfig } from "@ruiapp/move-style";
import { RapidFormItemConfig } from "../rapid-form-item/rapid-form-item-types";
import { RapidFormSubmitOptions } from "../../types/rapid-action-types";

export type RapidFormConfig = {
  /**
   * 数据源编号：当disabledLoadStore为true时，忽略当前字段配置
   */
  dataSourceCode?: string | null;

  /**
   * 禁用store后，dataSourceCode不起作用
   */
  disabledLoadStore?: boolean;

  /**
   * 大小，默认为`middle`
   */
  size?: "default" | "middle" | "small";

  requiredMark?: boolean | "optional";

  /**
   * 布局模式，默认为`horizontal`
   */
  layout?: "horizontal" | "vertical" | "inline";

  /**
   * 是否显示冒号
   */
  colon?: boolean;

  /**
   * 栏数，默认为1
   */
  column?: number;

  /**
   * 表单项
   */
  items: RapidFormItemConfig[];

  /**
   * 表单操作配置。如：提交、重置、取消等
   */
  actions?: RapidFormAction[];

  /**
   * 表单操作布局
   */
  actionsLayout?: {
    labelCol?: { span?: number; offset?: number };
    wrapperCol?: { span?: number; offset?: number };
  };

  /**
   * 操作按钮对齐方式
   */
  actionsAlign?: "left" | "right" | "center";

  /**
   * 表单固定字段，用于数据提交
   */
  fixedFields?: Record<string, any>;

  /**
   * 表单默认字段，可用于新建表单设置默认值
   */
  defaultFormFields?: Record<string, any>;

  onFinish?: RockEventHandlerConfig;

  onFormSubmit?: RockEventHandlerConfig;

  onFormRefresh?: RockEventHandlerConfig;

  onValuesChange?: RockEventHandlerConfig;

  /**
   * formData 适配器， 遵循 rui expression 规范（解析）
   */
  formDataAdapter?: string;
  /**
   * 表单提交前数据处理
   */
  beforeSubmitFormDataAdapter?: string;
};

/**
 * 表单动作
 */
export type RapidFormAction = {
  /**
   * 操作类型
   */
  actionType: RapidFormActionType;

  /**
   * 按钮类型
   */
  buttonType?: "primary" | "ghost" | "dashed" | "link" | "text" | "default";

  /**
   * 操作文字
   */
  actionText?: string;

  /**
   * 操作按钮其它属性
   */
  actionProps?: any;

  /**
   * 动作数据，提交时会合并到表单数据中
   */
  actionData?: Record<string, any>;

  /**
   * 请求方法，设置后会覆盖表单的请求方法
   */
  requestMethod?: RapidFormSubmitOptions["requestMethod"];

  /**
   * 请求地址，设置后覆盖表单的请求地址
   */
  requestUrl?: RapidFormSubmitOptions["requestUrl"];

  /**
   * 表单固定字段。当操作类型为submit时，将会合并到表单数据中一起提交。
   */
  fixedFields?: RapidFormSubmitOptions["fixedFields"];

  $exps?: RockExpsConfig;
};

/**
 * 表单按钮的行为类型。`submit`表示提交表单；`reset`表示重置表单；`button`表示没有默认行为。
 */
export type RapidFormActionType =
  | "button"
  | "submit" // 提交
  | "reset"; // 重置

export interface RapidFormRockConfig extends ContainerRockConfig, RapidFormConfig {}
