import { RpdApplicationConfig } from "~/types";
import { IRpdServer, RapidPlugin } from "./server";
import { Next, RouteContext } from "./routeContext";
import { Logger } from "~/facilities/log/LogFacility";

export interface ActionHandlerContext {
  logger: Logger;
  routerContext: RouteContext;
  next: Next;
  server: IRpdServer;
  applicationConfig: RpdApplicationConfig;
  input?: any;
  output?: any;
  status?: Response["status"];
}

export type ActionHandler = (ctx: ActionHandlerContext, options: any) => void | Promise<void>;

export interface IPluginActionHandler {
  code: string;
  handler: (plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) => void | Promise<void>;
}
