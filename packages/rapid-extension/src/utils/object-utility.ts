import { findIndex, get } from "lodash";

export function objectMatch(obj: Record<string, any>, inputValue: string, fieldNames: string[]) {
  return (
    findIndex(fieldNames, (fieldName) => {
      return get(obj, fieldName, "").indexOf(inputValue) !== -1;
    }) !== -1
  );
}
