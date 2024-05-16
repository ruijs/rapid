/* eslint-disable @typescript-eslint/no-explicit-any */
import process from "process";
import path from "path";
import express from "express";
import compression from "compression";
import { format, transports } from "winston";
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
  EntityWatchPlugin,
  CronJobPlugin,
} from '@ruiapp/rapid-core';
import { createRapidRequestHandler } from '@ruiapp/rapid-express';

import serverOperations from "./app/_definitions/meta/server-operations";
import entityWatchers from "./app/_definitions/meta/entity-watchers";
import cronJobs from "./app/_definitions/meta/cron-jobs";

import "dotenv/config";

const isDevelopmentEnv = process.env.NODE_ENV === "development";

const BUILD_DIR = path.join(process.cwd(), "build");

export async function startServer() {
  const logger = createAppLogger({
    level: isDevelopmentEnv? "debug" : "info",
  });
  const app = express();

  app.use(compression());

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  // Remix fingerprints its assets so we can cache forever.
  app.use(
    "/build",
    express.static("public/build", { immutable: true, maxAge: "1y" })
  );

  // Everything else (like favicon.ico) is cached for an hour. You may want to be
  // more aggressive with this caching.
  app.use(express.static("public", { maxAge: "1h" }));

  if (isDevelopmentEnv) {
    app.use(expressWinston.logger({
      format: format.combine(
        format.timestamp(),
        format.splat(),
      ),
      transports: [
        new transports.Console({
          format: consoleFormat(),
        })
      ],
      meta: false,
      expressFormat: true,
    }));
  }

  const envFromProcess = process.env;
  const env = {
    get: (name: string, defaultValue = "") => {
      return envFromProcess[name] || defaultValue;
    }
  };

  const defaultJWTKey = "DyYR1em73ZR5s3rUV32ek3FCZBMxE0YMjuPCvpyQKn+MhCQwlwCiN+8ghgTYcoijtLhKX4G93DPxsJOIuf/ub5qRi0lx5AnHEYGQ8c2zpxJ873viF7marKQ7k5dtBU83f0Oki3aeugSeAfYbOzeK49+LopkgjDeQikgLMyC4JFo=";
  const rapidConfig = {
    dbHost: env.get("DATABASE_HOST", "127.0.0.1"),
    dbPort: parseInt(env.get("DATABASE_PORT"), 10) || 5432,
    dbName: env.get("DATABASE_NAME", "project_matrix"),
    dbUser: env.get("DATABASE_USERNAME", "postgres"),
    dbPassword: env.get("DATABASE_PASSWORD", "postgres"),
    dbDefaultSchema: env.get("DATABASE_DEFAULT_SCHEMA") || 'public',
    dbPoolMaxConnections: parseInt(env.get("DATABASE_POOL_MAX_CONNECTIONS"), 10) || 20,
    sessionCookieName: env.get("SESSION_COOKIE_NAME", "RAPID_SESSION"),
    jwtKey: env.get("JWT_KEY", defaultJWTKey),
    localFileStoragePath: env.get("LOCAL_FILE_STORAGE_PATH", "/data/rapid-data/local-storage"),
  };
  logger.info("Staring rapid with config: ", rapidConfig)

  const databaseAccessor  = new DatabaseAccessor(logger, {
    host: rapidConfig.dbHost,
    port: rapidConfig.dbPort,
    database: rapidConfig.dbName,
    user: rapidConfig.dbUser,
    password: rapidConfig.dbPassword,
    maxConnections: rapidConfig.dbPoolMaxConnections,
  });

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
    plugins: [
      new MetaManagePlugin(),
      new DataManagePlugin(),
      new RouteManagePlugin(),
      new SequencePlugin(),
      new WebhooksPlugin(),
      new AuthPlugin(),
      new FileManagePlugin(),
      new ServerOperationPlugin({
        operations: serverOperations,
      }),
      new StateMachinePlugin(),
      new EntityWatchPlugin({
        watchers: entityWatchers,
      }),
      new CronJobPlugin({
        jobs: cronJobs,
      }),
    ],
  });
  await rapidServer.start();

  const rapidRequestHandler = createRapidRequestHandler(rapidServer)
  app.use("/api", (req, res, next) => {
    rapidRequestHandler(req, res, next);
  });

  app.all(
    "*",
    isDevelopmentEnv
      ? (req, res, next) => {
          purgeRequireCache();

          return createRequestHandler({
            build: require(BUILD_DIR),
            mode: process.env.NODE_ENV,
          })(req, res, next);
        }
      : createRequestHandler({
          build: require(BUILD_DIR),
          mode: process.env.NODE_ENV,
        })
  );
  const port = process.env.PORT || 8000;

  app.listen(port, () => {
    logger.info("Express server listening on port %d", port);
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