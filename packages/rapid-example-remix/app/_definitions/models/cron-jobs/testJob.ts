import { CreateCacheFacilityOptions, Cache, type ActionHandlerContext, type CronJobConfiguration } from "@ruiapp/rapid-core";
import dayjs from "dayjs";

export default {
  code: "testJob",

  cronTime: "0 */1 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;

    logger.info("Executing test job...");

    const cache = await server.getFacility<Cache, CreateCacheFacilityOptions>("cache", { providerName: "redis" });
    let value = await cache.get("foo");
    if (value) {
      logger.info("Cache item found, value: ", value);
    } else {
      value = { time: dayjs().format("YYYY-MM-DD HH:mm:ss") };
      await cache.set("foo", value, {
        ttl: 120000,
      });
      logger.info("Cache item created, value: ", value);
    }
  },
} satisfies CronJobConfiguration;
