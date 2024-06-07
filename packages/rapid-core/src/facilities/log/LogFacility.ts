import winston from "winston";

export interface Logger {
  log: winston.LogMethod;
  /**
   * The service/app is going to stop or become unusable now. An operator should definitely look into this immediately.
   */
  emerg: winston.LeveledLogMethod;
  /**
   * Fatal for a particular service, but the app continues servicing other requests. An operator should look at this immediately.
   */
  crit: winston.LeveledLogMethod;
  /**
   * Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
   */
  error: winston.LeveledLogMethod;
  /**
   * A note on something that should probably be looked at by an operator eventually.
   */
  warn: winston.LeveledLogMethod;
  /**
   * Detail on regular operation.
   */
  info: winston.LeveledLogMethod;
  /**
   * Anything else, i.e. too verbose to be included in "info" level.
   */
  debug: winston.LeveledLogMethod;
  /**
   * Logging from external libraries used by your app or very detailed application logging.
   */
  verbose: winston.LeveledLogMethod;

  child(options: Object): Logger;
}
