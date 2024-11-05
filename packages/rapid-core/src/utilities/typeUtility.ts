export function isUndefined(val: any) {
  return typeof val === "undefined";
}

export function isNull(val: any) {
  return val === null;
}

export function isNullOrUndefined(val: any) {
  return isNull(val) || isUndefined(val);
}

export function isNullOrUndefinedOrEmpty(val: any) {
  return isNull(val) || isUndefined(val) || val === "";
}
