import { ActionHandlerContext } from "~/core/actionHandler";
import { RpdHttpMethod } from "~/types";

export interface ServerOperation {
  code: string;
  description?: string;
  method: RpdHttpMethod;
  handler: (ctx: ActionHandlerContext) => Promise<void>;
}

export interface ServerOperationPluginInitOptions {
  operations: ServerOperation[];
}