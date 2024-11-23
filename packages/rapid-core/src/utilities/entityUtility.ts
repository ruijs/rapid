import { isObject } from "lodash";

export function getEntityRelationTargetId(entity: Record<string, any>, propName: string, targetColumnName?: string) {
  if (!entity) {
    throw new Error(`"entity" parameter is required.`);
  }

  let targetId: number | { id?: number } = entity[propName];
  if (!targetId && targetColumnName) {
    targetId = entity[targetColumnName];
  }

  if (isObject(targetId)) {
    return targetId.id;
  } else {
    return targetId;
  }
}
