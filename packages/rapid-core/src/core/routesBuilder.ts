import Router from "koa-tree-router";
import qs from "qs";
import { ActionHandlerContext } from "~/core/actionHandler";
import { IRpdServer } from "~/core/server";
import { RpdApplicationConfig } from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { Next, RouteContext } from "./routeContext";
import { cloneDeep, isFunction, isString } from "lodash";

export async function buildRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig) {
  const logger = server.getLogger();
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

    (router as any)[routeConfig.method.toLowerCase()](routePath, async (routerContext: RouteContext, next: Next) => {
      routerContext.routeConfig = cloneDeep(routeConfig);
      const { request, params } = routerContext;

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

      routerContext.response.status = 200;

      let handlerContext: ActionHandlerContext = {
        logger,
        routerContext,
        next,
        server,
        applicationConfig,
        input,
      };

      await server.beforeRunRouteActions(handlerContext);

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
      } else {
        throw new Error(`No handler or actions defined for route ${routeConfig.code}`);
      }

      if (!isNullOrUndefined(handlerContext.output)) {
        routerContext.json(handlerContext.output, handlerContext.status);
      }
    });
  });

  return router.routes();
}
