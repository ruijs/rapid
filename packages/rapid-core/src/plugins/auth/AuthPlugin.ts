/**
 * Auth manager plugin
 */

import * as _ from "lodash";
import {
  RpdApplicationConfig,
} from "~/types";
import { IRpdServer, RapidPlugin, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";

import pluginActionHandlers from "./actionHandlers";
import pluginModels from "./models";
import pluginRoutes from "./routes";
import { RouteContext } from "~/core/routeContext";
import { verifyJwt } from "~/utilities/jwtUtility";


class AuthPlugin implements RapidPlugin {
  get code(): string {
    return "authManager";
  }

  get description(): string {
    return null;
  }

  get extendingAbilities(): RpdServerPluginExtendingAbilities[] {
    return [];
  }

  get configurableTargets(): RpdServerPluginConfigurableTargetOptions[] {
    return [];
  }

  get configurations(): RpdConfigurationItemOptions[] {
    return [];
  }

  async initPlugin(server: IRpdServer): Promise<any> {
  }

  async registerMiddlewares(server: IRpdServer): Promise<any> {
  }

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    for (const actionHandler of pluginActionHandlers) {
      server.registerActionHandler(this, actionHandler);
    }
  }

  async registerEventHandlers(server: IRpdServer): Promise<any> {
  }

  async registerMessageHandlers(server: IRpdServer): Promise<any> {
  }

  async registerTaskProcessors(server: IRpdServer): Promise<any> {
  }

  async onLoadingApplication(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureModelProperties(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    console.log("authManager.onApplicationLoaded");
  }

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async onPrepareRouteContext(server: IRpdServer, routeContext: RouteContext) {
    const request = routeContext.request;
    let token: string;

    const headers = request.headers;
    // No Authorization header
    if (headers.has("Authorization")) {
      // Authorization header has no Bearer or no token
      const authHeader = headers.get("Authorization")!;
      if (!authHeader.startsWith("Bearer ") || authHeader.length <= 7) {
        throw new Error('AUTHORIZATION_HEADER_INVALID');
      }

      token = authHeader.slice(7);
    } else {
      token = request.cookies[server.config.sessionCookieName];
    }

    try {
      const tokenPayload = verifyJwt(token, server.config.jwtKey);
      routeContext.state.userId = tokenPayload.aud as string;
      routeContext.state.userLogin = tokenPayload.act as string;
    } catch (err) {
      console.warn(err);
    }
  }
}

export default AuthPlugin;
