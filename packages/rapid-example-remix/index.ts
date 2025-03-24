import { createLogger, createRapidServer, createExpressApp, startWebServer } from "./server";

async function run() {
  const logger = createLogger();
  const rapidServer = await createRapidServer(logger, {});
  await rapidServer.start();

  const expressApp = await createExpressApp(rapidServer);
  await startWebServer(logger, rapidServer, expressApp);
}

run();
