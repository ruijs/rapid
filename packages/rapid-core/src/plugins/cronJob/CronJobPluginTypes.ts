import { CronJob } from "cron";
import { CronJobConfiguration } from "~/types/cron-job-types";

export type RunCronJobActionHandlerOptions = {
  code?: string;
};

export type RunCronJobInput = {
  code?: string;
  input?: any;
};

export type NamedCronJobInstance = {
  code: string;
  instance: CronJob;
};

export type JobRunningResult = "success" | "failed" | "error";

export type SysCronJob = {
  id: number;
  code: string;
  description: string;
  cronTime: string;
  disabled: boolean;
  jobOptions: CronJobConfiguration["jobOptions"];
  isRunning: boolean;
  nextRunningTime: string;
  lastRunningTime: string;
  lastRunningResult?: JobRunningResult;
  lastErrorMessage?: string;
  lastErrorStack?: string;
  actionHandlerCode?: string;
  handler?: string;
  handleOptions?: Record<string, any>;
  onError?: string;
};

export type UpdateJobConfigOptions = {
  code: string;
  cronTime?: string;
  disabled?: boolean;
  jobOptions?: CronJobConfiguration["jobOptions"];
};
