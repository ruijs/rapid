import { ActionHandlerContext } from "~/core/actionHandler";

export interface CronJobConfiguration {
  /**
   * 定时任务编号
   */
  code: string;

  /**
   * 定时任务描述
   */
  description?: string;

  /**
   * 是否禁用
   */
  disabled?: boolean;

  /**
   * crontab 表达式
   */
  cronTime: string;

  /**
   * 任务设置
   */
  jobOptions?: CronJobOptions;

  /**
   * 任务处理程序编号。当指定处理程序编号时，忽略 handler 配置。
   */
  actionHandlerCode?: string;

  /**
   * 定时任务处理程序
   * @param ctx
   * @param options
   * @returns
   */
  handler?: (ctx: ActionHandlerContext, options: any) => Promise<void>;

  /**
   * 处理定时任务时的设置选项
   */
  handleOptions?: any;
}

export interface CronJobOptions {
  /**
   * Instantly triggers the onTick function post initialization. Default is false.
   */
  runOnInit?: boolean;

  /**
   * If true, no additional instances of the onTick callback function will run until the current onTick callback has completed. Any new scheduled executions that occur while the current callback is running will be skipped entirely. Default is false.
   */
  waitForCompletion?: boolean;
}
