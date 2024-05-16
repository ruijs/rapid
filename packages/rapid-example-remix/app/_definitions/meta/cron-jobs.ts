import type { CronJobConfiguration as TCronJobConfiguration } from '@ruiapp/rapid-core';
import testJob from '../models/cron-jobs/testJob';

export default [
  testJob,
] as TCronJobConfiguration[];
