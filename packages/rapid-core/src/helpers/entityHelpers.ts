export function getEntityPartChanges(
  before: any,
  after: any,
): Record<string, any> | null {
  if (!before) {
    throw new Error("Argument 'before' can not be null.");
  }

  if (!after) {
    throw new Error("Argument 'after' can not be null.");
  }

  let changed = null;
  for (const key in after) {
    if (after[key] != before[key]) {
      if (changed) {
        changed[key] = after[key];
      } else {
        changed = { [key]: after[key] };
      }
    }
  }
  return changed;
}
