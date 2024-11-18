import { CacheProvider, type ActionHandlerContext, type CronJobConfiguration } from "@ruiapp/rapid-core";
import dayjs from "dayjs";

export default {
  code: "testJob",

  cronTime: "0 */1 * * * *",

  async handler(ctx: ActionHandlerContext) {
    const { server, logger } = ctx;

    logger.info("Executing test job...");

    const cacheProvider = await server.getFacility<CacheProvider>("cache");
    let value = await cacheProvider.get("foo");
    if (value) {
      logger.info("Cache item found, value: %s", value);
    } else {
      value = dayjs().format("YYYY-MM-DD HH:mm:ss");
      await cacheProvider.set("foo", value, {
        ttl: 120000,
      });
      logger.info("Cache item created, value: %s", value);
    }
  },
} satisfies CronJobConfiguration;
