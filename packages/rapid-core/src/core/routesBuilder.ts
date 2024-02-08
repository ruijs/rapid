import Router from "koa-tree-router";
import qs from "qs";
import { HttpHandlerContext } from "~/core/httpHandler";
import { IRpdServer } from "~/core/server";
import { RpdApplicationConfig } from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { Next, RouteContext } from "./routeContext";

export async function buildRoutes(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
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

        console.debug(`${requestMethod} ${request.url.toString()}`);
        console.debug(`input: ${JSON.stringify(input)}`);

        let handlerContext: HttpHandlerContext = {
          routerContext,
          next,
          server,
          applicationConfig,
          input,
        };

        for (const handlerConfig of routeConfig.handlers) {
          const handler = server.getHttpHandlerByCode(handlerConfig.code);
          if (!handler) {
            throw new Error("Unknown handler: " + handlerConfig.code);
          }

          const result = handler(handlerContext, handlerConfig.config);
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
