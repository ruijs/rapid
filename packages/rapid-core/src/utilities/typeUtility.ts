export function isUndefined(val: any) {
  return typeof val === "undefined";
}

export function isNull(val: any) {
  return val === null;
}

export function isNullOrUndefined(val: any) {
  return isNull(val) || isUndefined(val);
}
