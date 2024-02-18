import Router from "koa-tree-router";
import qs from "qs";
import { ActionHandlerContext } from "~/core/actionHandler";
import { IRpdServer } from "~/core/server";
import { RpdApplicationConfig } from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { Next, RouteContext } from "./routeContext";
import { cloneDeep } from "lodash";

export async function buildRoutes(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  const logger = server.getLogger();
  const router = new Router();

  let baseUrl = server.config.baseUrl;
  if (baseUrl) {
    if (baseUrl.endsWith('/')) {
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

    (router as any)[routeConfig.method.toLowerCase()](
      routePath,
      async (routerContext: RouteContext, next: Next) => {
        routerContext.routeConfig = cloneDeep(routeConfig);
        const { request, params } = routerContext;

        let search = request.url.search;
        if (search && search.startsWith("?")) {
          search = search.substring(1);
        }
        const query = qs.parse(search);
        const input = Object.assign({}, params, query);

        const requestMethod = request.method;
        if (
          (requestMethod === "POST" || requestMethod === "PUT" ||
            requestMethod === "PATCH")
        ) {
          const body = request.body;
          if (body) {
            Object.assign(input, body.value);
          }
        }

        // Normalize input value

        logger.debug("Processing rapid request.", {
          method: requestMethod,
          url: request.url.toString(),
          input
        });

        let handlerContext: ActionHandlerContext = {
          logger,
          routerContext,
          next,
          server,
          applicationConfig,
          input,
        };

        await server.beforeRunRouteActions(handlerContext);

        for (const actionConfig of routeConfig.actions) {
          const actionCode = actionConfig.code;
          const handler = server.getActionHandlerByCode(actionCode);
          if (!handler) {
            throw new Error("Unknown handler: " + actionCode);
          }

          const result = handler(handlerContext, actionConfig.config);
          if (result instanceof Promise) {
            await result;
          }
        }

        if (!isNullOrUndefined(handlerContext.output)) {
          routerContext.json(handlerContext.output, handlerContext.status);
        }
      },
    );
  });

  return router.routes();
}
