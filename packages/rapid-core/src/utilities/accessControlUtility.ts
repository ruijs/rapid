import { find } from "lodash";

export type PermissionCheckPolicy = {
  any?: string[];
  all?: string[];
}

export function isAccessAllowed(policy: PermissionCheckPolicy, allowedActions: string[]): boolean {
  let isAnyCheckPassed = true;
  let isAllCheckPassed = true;

  if (policy.any) {
    isAnyCheckPassed = false;
    for (const action of policy.any) {
      if (find(allowedActions, item => item === action) != null) {
        isAnyCheckPassed = true;
        break;
      }
    }
  }

  if (policy.all) {
    isAllCheckPassed = true;
    for (const action of policy.all) {
      if (find(allowedActions, item => item === action) == null) {
        isAnyCheckPassed = false;
        break;
      }
    }
  }

  return isAnyCheckPassed && isAllCheckPassed;
}