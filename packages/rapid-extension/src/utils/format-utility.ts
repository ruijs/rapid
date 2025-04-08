import dayjs from "dayjs";

export function formatDateTime(value: dayjs.ConfigType, format?: string) {
  const dateTime = dayjs(value);
  if (!dateTime.isValid()) {
    return "-";
  }
  return dateTime.format(format || "YYYY-MM-DD HH:mm:ss");
}

export function formatFileSize(bytes: number, dp = 1) {
  const thresh = 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + " B";
  }

  const units = ["KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);

  return bytes.toFixed(dp) + " " + units[u];
}
