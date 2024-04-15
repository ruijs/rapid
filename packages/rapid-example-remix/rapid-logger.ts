import dayjs from "dayjs";
import type { Logger } from "winston";
import { createLogger, transports, format } from "winston";
import { MESSAGE } from "triple-beam";
import { logLevels } from "./app/rui-logger";

export const consoleFormat = format((info) => {
  const stringifiedRest = JSON.stringify(Object.assign({}, info, {
    timestamp: undefined,
    level: undefined,
    message: undefined,
    splat: undefined
  }));

  const padding = info.padding && info.padding[info.level] || '';
  const formattedTime = dayjs(info.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS')
  if (stringifiedRest !== '{}') {
    info[MESSAGE] = `[${formattedTime}] ${info.level}:${padding} ${info.message} ${stringifiedRest}`;
  } else {
    info[MESSAGE] = `[${formattedTime}] ${info.level}:${padding} ${info.message}`;
  }

  return info;
});

export interface CreateAppLoggerOptions {
  level?: string;
}

export function createAppLogger(options: CreateAppLoggerOptions): Logger {
  const logger = createLogger({
    level: options.level,
    levels: logLevels,
    format: format.combine(
      format.timestamp(),
      format.splat(),
    ),
    transports: [
      new transports.Console({
        format: consoleFormat(),
      }),
    ]
  });

  return logger;
}
