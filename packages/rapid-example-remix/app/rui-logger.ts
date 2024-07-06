/* eslint-disable @typescript-eslint/no-explicit-any */
import type { LoggerProvider, RuiLeveledLogMethod, RuiLogLevelNames, RuiLogger } from "@ruiapp/move-style";

export const logLevels = {
  /**
   * The service/app is going to stop or become unusable now. An operator should definitely look into this immediately.
   */
  emerg: 1,
  /**
   * Fatal for a particular service, but the app continues servicing other requests. An operator should look at this immediately.
   */
  crit: 2,
  /**
   * Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
   */
  error: 3,
  /**
   * A note on something that should probably be looked at by an operator eventually.
   */
  warn: 4,
  /**
   * Detail on regular operation.
   */
  info: 5,
  /**
   * Anything else, i.e. too verbose to be included in "info" level.
   */
  debug: 6,
  /**
   * Logging from external libraries used by your app or very detailed application logging.
   */
  verbose: 7,
};

export class RuiConsoleLogger implements RuiLogger {
  level?: RuiLogLevelNames;

  isLevelEnabled(level: RuiLogLevelNames) {
    const priorityOfTestedLevel = logLevels[level] || 0;
    const priorityOfEnabledLevel = logLevels[this.level || "info"];
    return priorityOfTestedLevel <= priorityOfEnabledLevel;
  }

  isEmergEnabled() {
    return this.isLevelEnabled("emerg");
  }

  isCritEnabled() {
    return this.isLevelEnabled("crit");
  }

  isErrorEnabled() {
    return this.isLevelEnabled("error");
  }

  isWarnEnabled() {
    return this.isLevelEnabled("warn");
  }

  isInfoEnabled() {
    return this.isLevelEnabled("info");
  }

  isDebugEnabled() {
    return this.isLevelEnabled("debug");
  }

  isVerboseEnabled() {
    return this.isLevelEnabled("verbose");
  }

  log(level: string, message: string, meta?: object) {
    ((this as any)[level] as RuiLeveledLogMethod)(message, meta);
  }

  emerg(message: string, meta?: object) {
    if (this.isLevelEnabled("emerg")) {
      console.error(message, meta);
    }
  }

  crit(message: string, meta?: object) {
    if (this.isLevelEnabled("crit")) {
      console.error(message, meta);
    }
  }

  error(message: string, meta?: object) {
    if (this.isLevelEnabled("error")) {
      console.error(message, meta);
    }
  }

  warn(message: string, meta?: object) {
    if (this.isLevelEnabled("warn")) {
      console.warn(message, meta);
    }
  }

  info(message: string, meta?: object) {
    if (this.isLevelEnabled("info")) {
      console.info(message, meta);
    }
  }

  debug(message: string, meta?: object) {
    if (this.isLevelEnabled("debug")) {
      console.debug(message, meta);
    }
  }

  verbose(message: string, meta?: object) {
    if (this.isLevelEnabled("verbose")) {
      console.debug(message, meta);
    }
  }
}

export class RuiLoggerProvider implements LoggerProvider {
  createLogger() {
    if (!global.window) {
      return null as any;
    }

    const logger = new RuiConsoleLogger();
    return logger;
  }
}
