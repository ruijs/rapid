const process = require("process");
const path = require("path");
const express = require("express");
const DatabaseAccessor = require("./database-accessor");
const { RapidServer } = require('@ruiapp/rapid-core');
const { createRapidRequestHandler } = require('@ruiapp/rapid-express');

exports.startServer = async () => {
  const app = express();

  // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
  app.disable("x-powered-by");

  const envFromFile = {};
  const envFromProcess = process.env;
  const env = {
    get: (name, defaultValue = "") => {
      return envFromFile[name] || envFromProcess[name] || defaultValue;
    }
  };

  const defaultJWTKey = "";
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

  const databaseAccessor  = new DatabaseAccessor({
    host: rapidConfig.dbHost,
    port: rapidConfig.dbPort,
    database: rapidConfig.dbName,
    user: rapidConfig.dbUser,
    password: rapidConfig.dbPassword,
    maxConnections: rapidConfig.dbPoolMaxConnections,
  });

  const rapidServer = new RapidServer({
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
  });
  await rapidServer.start();

  const rapidRequestHandler = createRapidRequestHandler(rapidServer)
  app.use("/api", (req, res, next) => {
    rapidRequestHandler(req, res, next);
  });

  app.get("/", (req, res) => {
    res.send({
      status: 'ok',
    });
  })

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Express server listening on port ${port}`);
  });
}