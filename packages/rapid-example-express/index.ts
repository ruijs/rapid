import { createAppLogger } from "./logger";
import { startServer } from "./server";

const logger = createAppLogger();
startServer(logger);
