export function parseBoolean(text: string) {
  if (!text) {
    return false;
  }

  text = text.toLowerCase();
  if (text === "0" || text === "false" || text === "off") {
    return false;
  }

  if (text === "1" || text === "true" || text === "on") {
    return true;
  }

  throw new Error(`Failed to parse boolean, parameter "text" should be one of "0", "1", "true", "false", "on", "off", null, undefined or empty string.`);
}
