import { fetchWithTimeout } from "../utilities/httpUtility";
import { ProxyContext, ProxyOptions } from "./types";
import { RouteContext} from "~/core/routeContext";

export async function doProxy(
  sourceRouterCtx: RouteContext,
  options: ProxyOptions,
) {
  const proxyCtx = createProxyContext(sourceRouterCtx, options);
  const targetRes = await sendTargetRequest(proxyCtx);
  sendSourceResponse(proxyCtx, targetRes);
}

export function createProxyContext(
  sourceRouterCtx: RouteContext,
  options: ProxyOptions,
) {
  return {
    sourceContext: {
      request: sourceRouterCtx.request,
      response: sourceRouterCtx.response,
    },
    targetContext: {},
    options: options,
  } satisfies ProxyContext;
}

export async function sendTargetRequest(proxyCtx: ProxyContext) {
  const { sourceContext, options: proxyOptions } = proxyCtx;
  const { target, timeout } = proxyOptions;
  const { request: srcReq } = sourceContext;
  const { method } = srcReq;

  const reqInit: RequestInit = {
    method,
  };
  return await fetchWithTimeout(target, reqInit, timeout);
}

export async function sendSourceResponse(
  proxyCtx: ProxyContext,
  targetRes: Response,
) {
  const { response: srcRes } = proxyCtx.sourceContext;
  srcRes.status = targetRes.status;
  srcRes.body = targetRes.body;
}
