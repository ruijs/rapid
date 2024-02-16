import { isArray, mergeWith } from "lodash";

export function mergeInput(defaultInput: any, input: any, fixedInput: any) {
  return mergeWith({}, defaultInput, input, fixedInput, doNotMergeArray);
}

function doNotMergeArray(objValue: any, srcValue: any) {
  if (isArray(srcValue)) {
    return srcValue;
  }
}
