/* eslint-disable @typescript-eslint/no-explicit-any */
import process from "process";
import path from "path";
import express, { Application } from "express";
import compression from "compression";
import { format, Logger, transports } from "winston";
import expressWinston from "express-winston";
import { createRequestHandler } from "@remix-run/express";
import { consoleFormat, createAppLogger } from "./rapid-logger";
import DatabaseAccessor from "./database-accessor";
import {
  RapidServer,
  MetaManagePlugin,
  DataManagePlugin,
  RouteManagePlugin,
  SequencePlugin,
  WebhooksPlugin,
  AuthPlugin,
  FileManagePlugin,
  ServerOperationPlugin,
  StateMachinePlugin,
  // EntityWatchPlugin,
  CronJobPlugin,
  EntityAccessControlPlugin,
  SettingPlugin,
  MailPlugin,
  NotificationPlugin,
  LicensePlugin,
  CacheFactory,
} from "@ruiapp/rapid-core";
import { createRapidRequestHandler } from "@ruiapp/rapid-express";

import serverOperations from "./app/_definitions/meta/server-operations";
import entityWatchers from "./app/_definitions/meta/entity-watchers";
import cronJobs from "./app/_definitions/meta/cron-jobs";

import "dotenv/config";
import RedisCacheProvider from "./rapid-facilities/redis/RedisCacheProvider";
import RedisClientFactory from "./rapid-facilities/redis/RedisClientFactory";
import { getRapidAppDefinitionFromRapidServer } from "./app/utils/app-definition-utility";
import { parseBoolean } from "./app/utils/boolean-utils";

const isDevelopmentEnv = process.env.NODE_ENV === "development";

const BUILD_DIR = path.join(process.cwd(), "build");

const envFromProcess = process.env;
const env = {
  get: (name: string, defaultValue = "") => {
    return envFromProcess[name] || defaultValue;
  },
};

export function createLogger() {
  const logLevel = env.get("RAPID_LOG_LEVEL", isDevelopmentEnv ? "debug" : "info");
  const logger = createAppLogger({
    level: logLevel,
  });

  return logger;
}

export async function createRapidServer(logger: Logger, envs: any) {
  envs = Object.assign({}, process.env, envs || {});
  const env = {
    get: (name: string, defaultValue = "") => {
      return envs[name] || defaultValue;
    },
  };

  const defaultJWTKey = "DyYR1em73ZR5s3rUV32ek3FCZBMxE0YMjuPCvpyQKn+MhCQwlwCiN+8ghgTYcoijtLhKX4G93DPxsJOIuf/ub5qRi0lx5AnHEYGQ8c2zpxJ873viF7marKQ7k5dtBU83f0Oki3aeugSeAfYbOzeK49+LopkgjDeQikgLMyC4JFo=";
  const rapidConfig = {
    dbHost: env.get("DATABASE_HOST", "127.0.0.1"),
    dbPort: parseInt(env.get("DATABASE_PORT"), 10) || 5432,
    dbName: env.get("DATABASE_NAME", "project_matrix"),
    dbUser: env.get("DATABASE_USERNAME", "postgres"),
    dbPassword: env.get("DATABASE_PASSWORD", "postgres"),
    dbDefaultSchema: env.get("DATABASE_DEFAULT_SCHEMA") || "public",
    dbPoolMaxConnections: parseInt(env.get("DATABASE_POOL_MAX_CONNECTIONS"), 10) || 20,
    sessionCookieName: env.get("SESSION_COOKIE_NAME", "RAPID_SESSION"),
    jwtKey: env.get("JWT_KEY", defaultJWTKey),
    localFileStoragePath: env.get("LOCAL_FILE_STORAGE_PATH", "/data/rapid-data/local-storage"),
    smtpHost: env.get("MAIL_SMTP_HOST"),
    smtpPort: parseInt(env.get("MAIL_SMTP_PORT"), 10) || 587,
    smtpSecure: env.get("MAIL_SMTP_SECURE") === "true",
    smtpUsername: env.get("MAIL_SMTP_USERNAME"),
    smtpPassword: env.get("MAIL_SMTP_PASSWORD"),
  };
  logger.info("Staring rapid with config: ", rapidConfig);

  const databaseAccessor = new DatabaseAccessor(logger, {
    host: rapidConfig.dbHost,
    port: rapidConfig.dbPort,
    database: rapidConfig.dbName,
    user: rapidConfig.dbUser,
    password: rapidConfig.dbPassword,
    maxConnections: rapidConfig.dbPoolMaxConnections,
  });

  const disableCronJob = parseBoolean(env.get("DISABLE_CRON_JOB"));

  const rapidServer = new RapidServer({
    logger,
    databaseAccessor,
    databaseConfig: {
      dbHost: rapidConfig.dbHost,
      dbPort: rapidConfig.dbPort,
      dbName: rapidConfig.dbName,
      dbUser: rapidConfig.dbUser,
      dbPassword: rapidConfig.dbPassword,
      dbDefaultSchema: rapidConfig.dbDefaultSchema,
    },
    serverConfig: {
      sessionCookieName: rapidConfig.sessionCookieName,
      jwtKey: rapidConfig.jwtKey,
      localFileStoragePath: rapidConfig.localFileStoragePath,
    },
    facilityFactories: [
      new RedisClientFactory({
        url: env.get("REDIS_URL", "redis://localhost:6379"),
      }),
      new CacheFactory({
        providers: [new RedisCacheProvider()],
      }),
    ],
    plugins: [
      new MetaManagePlugin({
        syncDatabaseSchemaOnLoaded: parseBoolean(env.get("RAPID_SYNC_DATABASE_SCHEMA_ON_LOADED", "false")),
      }),
      new DataManagePlugin(),
      new RouteManagePlugin(),
      new SequencePlugin(),
      new WebhooksPlugin(),
      new AuthPlugin(),
      new FileManagePlugin(),
      new ServerOperationPlugin({
        operations: serverOperations,
      }),
      new SettingPlugin(),
      new LicensePlugin({
        encryptionKey: env.get("RAPID_LICENSE_ENCRYPTION_KEY", ""),
      }),
      new EntityAccessControlPlugin(),
      new StateMachinePlugin(),
      ...(disableCronJob ? [] : [new CronJobPlugin()]),
      new MailPlugin({
        smtpServer: {
          host: rapidConfig.smtpHost,
          port: rapidConfig.smtpPort,
          secure: rapidConfig.smtpSecure,
          username: rapidConfig.smtpUsername,
          password: rapidConfig.smtpPassword,
        },
      }),
      new NotificationPlugin(),
    ],
    entityWatchers,
    cronJobs,
  });

  return rapidServer;
}

export async function createExpressApp(rapidServer: RapidServer) {
  const app = express();

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  // Remix fingerprints its assets so we can cache forever.
  app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("public", { maxAge: "1h" }));

  const expressLogDisabled = parseBoolean(env.get("EXPRESS_LOG_DISABLED", "false"));
  if (isDevelopmentEnv || !expressLogDisabled) {
    app.use(
      expressWinston.logger({
        format: format.combine(format.timestamp(), format.splat()),
        transports: [
          new transports.Console({
            format: consoleFormat(),
          }),
        ],
        meta: false,
        expressFormat: true,
      }),
    );
  }

  const rapidRequestHandler = createRapidRequestHandler(rapidServer as any);
  app.use("/api", (req, res, next) => {
    rapidRequestHandler(req, res, next);
  });

  app.all(
    "*",
    isDevelopmentEnv
      ? (req, res, next) => {
          purgeRequireCache();
          return createRemixRequestHandler(rapidServer)(req, res, next);
        }
      : createRemixRequestHandler(rapidServer),
  );

  return app;
}

export async function startWebServer(logger: Logger, rapidServer: RapidServer, app: Application) {
  const port = process.env.PORT || 3000;

  app.listen(port, () => {
    logger.info("Express server listening on port %d", port);
  });
}

function createRemixRequestHandler(rapidServer: RapidServer) {
  const appDefinition = getRapidAppDefinitionFromRapidServer(rapidServer);
  return createRequestHandler({
    build: require(BUILD_DIR),
    mode: process.env.NODE_ENV,
    getLoadContext(req, res) {
      return {
        rapidServer,
        appDefinition,
      };
    },
  });
}

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // alternatively you can set up nodemon/pm2-dev to restart the server on
  // file changes, but then you'll have to reconnect to databases/etc on each
  // change. We prefer the DX of this, so we've included it for you by default
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}
