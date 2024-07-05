import { ActionHandlerContext } from "~/core/actionHandler";
import { RpdHttpMethod } from "~/types";
import { PermissionCheckPolicy } from "~/utilities/accessControlUtility";

export interface ServerOperation {
  code: string;
  description?: string;
  method: RpdHttpMethod;
  permissionCheck?: PermissionCheckPolicy;
  handler: (ctx: ActionHandlerContext) => Promise<void>;
}

export interface ServerOperationPluginInitOptions {
  operations: ServerOperation[];
}
