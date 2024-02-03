import { IPluginInstance, RpdApplicationConfig } from "~/types";
import { IRpdServer } from "./server";
import { Next, RouteContext } from "./routeContext";

export interface HttpHandlerContext {
  routerContext: RouteContext;
  next: Next;
  server: IRpdServer;
  applicationConfig: RpdApplicationConfig;
  input?: any;
  output?: any;
  status?: Response["status"];
}

export type PluginHttpHandler = (
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: any,
) => void | Promise<void>;

export type HttpRequestHandler = (
  ctx: HttpHandlerContext,
  options: any,
) => void | Promise<void>;

export interface IPluginHttpHandler {
  code: string;
  handler: PluginHttpHandler;
}