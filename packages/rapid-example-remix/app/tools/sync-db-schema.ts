import { createLogger, createRapidServer } from "../../server";

async function run() {
  const logger = createLogger();
  const rapidServer = await createRapidServer(logger, {
    DISABLE_CRON_JOB: "true",
    RAPID_SYNC_DATABASE_SCHEMA_ON_LOADED: "true",
  });
  await rapidServer.start();
}

run();
