import { ActionHandlerContext } from "~/core/actionHandler";
import { RpdHttpMethod } from "~/types";
import { PermissionCheckPolicy } from "~/utilities/accessControlUtility";

export interface ServerOperation {
  code: string;
  description?: string;
  method: RpdHttpMethod;

  /**
   * 接口路径，默认值为 `/app/{code}`
   */
  path?: string;
  permissionCheck?: PermissionCheckPolicy;
  handler: (ctx: ActionHandlerContext) => Promise<void>;
}

export interface ServerOperationPluginInitOptions {
  operations: ServerOperation[];
}
