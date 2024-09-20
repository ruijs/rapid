import { isNumber, isObject } from "lodash";
import { IRpdServer } from "~/core/server";
import { getEntityPropertyByCode, isOneRelationProperty } from "~/helpers/metaHelper";
import { RpdDataModel } from "~/types";

export function getEntityPartChanges(server: IRpdServer, model: RpdDataModel, before: any, after: any): Record<string, any> | null {
  if (!before) {
    throw new Error("Argument 'before' can not be null.");
  }

  if (!after) {
    throw new Error("Argument 'after' can not be null.");
  }

  let changed = false;
  let changes = {};
  for (const key in after) {
    const property = getEntityPropertyByCode(server, model, key);
    if (property && isOneRelationProperty(property)) {
      const afterValue: number | { id: number } | null = after[key];
      const beforeValue: number | { id: number } | null = before[key] || before[property.targetIdColumnName];
      if (afterValue) {
        if (isNumber(afterValue)) {
          if (beforeValue) {
            if (isNumber(beforeValue)) {
              if (afterValue != beforeValue) {
                changed = true;
                changes[key] = afterValue;
              }
            } else {
              if (afterValue != beforeValue.id) {
                changed = true;
                changes[key] = afterValue;
              }
            }
          } else {
            changed = true;
            changes[key] = afterValue;
          }
        } else {
          if (beforeValue) {
            if (isNumber(beforeValue)) {
              if (afterValue.id != beforeValue) {
                changed = true;
                changes[key] = afterValue;
              }
            } else {
              if (afterValue.id != beforeValue.id) {
                changed = true;
                changes[key] = afterValue;
              }
            }
          } else {
            changed = true;
            changes[key] = afterValue;
          }
        }
      } else {
        if (beforeValue) {
          changed = true;
          changes[key] = null;
        }
      }
    } else {
      if (after[key] != before[key]) {
        changed = true;
        changes[key] = after[key];
      }
    }
  }

  if (changed) {
    return changes;
  }
  return null;
}
