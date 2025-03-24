import { CreateCacheFacilityOptions, Cache, type ActionHandlerContext, type CronJobConfiguration } from "@ruiapp/rapid-core";
import dayjs from "dayjs";

export default {
  code: "cacheTestJob",

  description: "Job for testing cache expiration",

  cronTime: "0 0/1 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;

    const cache = await server.getFacility<Cache, CreateCacheFacilityOptions>("cache", { providerName: "redis" });
    let value = await cache.getObject("foo");
    if (value) {
      logger.info("Cache item found, value: ", value);
    } else {
      value = { time: dayjs().format("YYYY-MM-DD HH:mm:ss") };
      await cache.setObject("foo", value, {
        ttl: 120000,
      });
      logger.info("Cache item created, value: ", value);
    }
  },
} satisfies CronJobConfiguration;
