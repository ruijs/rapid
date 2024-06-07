import { ActionHandlerContext } from "~/core/actionHandler";
import { RpdHttpMethod } from "~/types";

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
   * crontab 表达式
   */
  cronTime: string;

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

export interface CronJobPluginInitOptions {
  jobs: CronJobConfiguration[];
}

export type RunCronJobActionHandlerOptions = {
  code?: string;
};

export type RunCronJobInput = {
  code?: string;
};
