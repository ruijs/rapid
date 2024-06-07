import dayjs from "dayjs";
import type { Logger, config } from "winston";
import { createLogger, transports, format } from "winston";
import { MESSAGE } from "triple-beam";

const levels: config.AbstractConfigSetLevels = {
  /**
   * The service/app is going to stop or become unusable now. An operator should definitely look into this immediately.
   */
  emerg: 0,
  /**
   * Fatal for a particular service, but the app continues servicing other requests. An operator should look at this immediately.
   */
  crit: 1,
  /**
   * Fatal for a particular request, but the service/app continues servicing other requests. An operator should look at this soon(ish).
   */
  error: 2,
  /**
   * A note on something that should probably be looked at by an operator eventually.
   */
  warn: 3,
  /**
   * Detail on regular operation.
   */
  info: 4,
  /**
   * Anything else, i.e. too verbose to be included in "info" level.
   */
  debug: 5,
  /**
   * Logging from external libraries used by your app or very detailed application logging.
   */
  verbose: 6,
};

const consoleFormat = format((info) => {
  const stringifiedRest = JSON.stringify(
    Object.assign({}, info, {
      timestamp: undefined,
      level: undefined,
      message: undefined,
      splat: undefined,
    }),
  );

  const padding = (info.padding && info.padding[info.level]) || "";
  const formattedTime = dayjs(info.timestamp).format("YYYY-MM-DD HH:mm:ss.SSS");
  if (stringifiedRest !== "{}") {
    info[MESSAGE] = `[${formattedTime}] ${info.level}:${padding} ${info.message} ${stringifiedRest}`;
  } else {
    info[MESSAGE] = `[${formattedTime}] ${info.level}:${padding} ${info.message}`;
  }

  return info;
});

export function createAppLogger(): Logger {
  const logger = createLogger({
    levels,
    format: format.combine(format.timestamp(), format.splat()),
    transports: [
      new transports.Console({
        format: consoleFormat(),
      }),
    ],
  });

  return logger;
}
