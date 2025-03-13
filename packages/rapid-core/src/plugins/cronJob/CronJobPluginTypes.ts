import { CronJob } from "cron";

export type RunCronJobActionHandlerOptions = {
  code?: string;
};

export type RunCronJobInput = {
  code?: string;
};

export type NamedCronJobInstance = {
  code: string;
  instance: CronJob;
};
