import type { CronJobConfiguration as TCronJobConfiguration } from '@ruiapp/rapid-core';
import cacheTestJob from '../models/cron-jobs/cacheTestJob';

export default [
  cacheTestJob,
] as TCronJobConfiguration[];
