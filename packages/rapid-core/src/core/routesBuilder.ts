import Router from "koa-tree-router";
import qs from "qs";
import { ActionHandlerContext } from "~/core/actionHandler";
import { IRpdServer } from "~/core/server";
import { RpdApplicationConfig, RpdRoute } from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { Next, RouteContext } from "./routeContext";
import { cloneDeep, isFunction, isString } from "lodash";
import { executeInRouteContext } from "~/helpers/dbTransactionHelper";

async function executeHandlerOfActions(server: IRpdServer, routeConfig: RpdRoute, handlerContext: ActionHandlerContext) {
  let handler = routeConfig.handler as any;
  if (handler) {
    if (isString(handler)) {
      handler = new Function(`return (${routeConfig.handler})`) as any;
    }

    if (isFunction(handler)) {
      const result = handler(handlerContext);
      if (result instanceof Promise) {
        await result;
      }
    } else {
      throw new Error(`Invalid handler for route ${routeConfig.code}: ${routeConfig.handler}`);
    }
  } else if (routeConfig.actions) {
    for (const actionConfig of routeConfig.actions) {
      const actionCode = actionConfig.code;
      const handler = server.getActionHandlerByCode(actionCode);
      if (!handler) {
        throw new Error("Unknown handler: " + actionCode);
      }

      await server.beforeRunActionHandler(handlerContext, actionConfig);

      const result = handler(handlerContext, actionConfig.config);
      if (result instanceof Promise) {
        await result;
      }
    }
  }
}

async function handleRouteRequest(routeContext: RouteContext, next: Next, server: IRpdServer, routeConfig: RpdRoute) {
  if (!routeConfig.handler && !routeConfig.actions) {
    throw new Error(`No handler or actions defined for route ${routeConfig.code}`);
  }

  const logger = server.getLogger();
  routeConfig = cloneDeep(routeConfig);
  routeContext.routeConfig = routeConfig;
  const { request, params } = routeContext;

  let search = request.url.search;
  if (search && search.startsWith("?")) {
    search = search.substring(1);
  }
  const query = qs.parse(search);
  const input = Object.assign({}, params, query);

  const requestMethod = request.method;
  if (requestMethod === "POST" || requestMethod === "PUT" || requestMethod === "PATCH") {
    const body = request.body;
    if (body) {
      Object.assign(input, body.value);
    }
  }

  // Normalize input value

  logger.debug("Processing rapid request.", {
    method: requestMethod,
    url: request.url.toString(),
    input,
  });

  routeContext.response.status = 200;

  let handlerContext: ActionHandlerContext = {
    logger,
    routerContext: routeContext,
    next,
    server,
    input,
    results: [],
  };

  await server.beforeRunRouteActions(handlerContext);

  await executeInRouteContext(routeContext, routeConfig.executeInDbTransaction, async () => {
    await executeHandlerOfActions(server, routeConfig, handlerContext);
  });

  if (!isNullOrUndefined(handlerContext.output)) {
    routeContext.json(handlerContext.output, handlerContext.status);
  }
}

export async function buildRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig) {
  const router = new Router();

  let baseUrl = server.config.baseUrl;
  if (baseUrl) {
    if (baseUrl.endsWith("/")) {
      baseUrl = baseUrl.substring(0, baseUrl.length - 1);
    }
  } else {
    baseUrl = "";
  }

  applicationConfig.routes.forEach((routeConfig) => {
    if (routeConfig.type !== "RESTful") {
      return;
    }

    const routePath = baseUrl + routeConfig.endpoint;

    (router as any)[routeConfig.method.toLowerCase()](routePath, (routeContext, next) => handleRouteRequest(routeContext, next, server, routeConfig));
  });

  return router.routes();
}
