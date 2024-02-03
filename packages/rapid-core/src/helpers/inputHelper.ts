import * as _ from "lodash";

export function mergeInput(defaultInput: any, input: any, fixedInput: any) {
  return _.mergeWith({}, defaultInput, input, fixedInput, doNotMergeArray);
}

function doNotMergeArray(objValue: any, srcValue: any) {
  if (_.isArray(srcValue)) {
    return srcValue;
  }
}
