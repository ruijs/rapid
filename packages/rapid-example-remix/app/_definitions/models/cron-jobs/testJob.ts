import type { ActionHandlerContext, CronJobConfiguration } from '@ruiapp/rapid-core';

export default {
  code: 'testJob',

  cronTime: '0 */1 * * * *',

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;

    logger.info('Executing test job...');
  },
} satisfies CronJobConfiguration;
