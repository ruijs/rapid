import { RapidRequest } from "~/core/request";
import { RunProxyHandlerOptions } from "../types";
import { RapidResponse } from "~/core/response";

export interface ProxyContext {
  sourceContext: ProxySourceContext;
  targetContext: ProxyTargetContext;
  options: ProxyOptions;
}

export interface ProxySourceContext {
  request: RapidRequest;
  response: RapidResponse;
}

export interface ProxyTargetContext {
  request?: RapidRequest;
  response?: RapidResponse;
}

export type ProxyOptions = RunProxyHandlerOptions;
