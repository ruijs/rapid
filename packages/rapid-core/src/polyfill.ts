export function fixBigIntJSONSerialize() {
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };
};