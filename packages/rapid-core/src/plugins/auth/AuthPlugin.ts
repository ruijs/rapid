/**
 * Auth manager plugin
 */

import { RpdApplicationConfig } from "~/types";
import {
  IRpdServer,
  RapidPlugin,
  RpdConfigurationItemOptions,
  RpdServerPluginConfigurableTargetOptions,
  RpdServerPluginExtendingAbilities,
} from "~/core/server";

import pluginActionHandlers from "./actionHandlers";
import pluginModels from "./models";
import pluginRoutes from "./routes";
import { RouteContext } from "~/core/routeContext";
import { verifyJwt } from "~/utilities/jwtUtility";
import AuthService from "./services/AuthService";
import { AuthPluginInitOptions } from "./AuthPluginTypes";

class AuthPlugin implements RapidPlugin {
  #options: AuthPluginInitOptions;
  #authService!: AuthService;

  constructor(options: AuthPluginInitOptions) {
    this.#options = Object.freeze(options);
  }

  get options(): AuthPluginInitOptions {
    return this.#options;
  }

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

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    for (const actionHandler of pluginActionHandlers) {
      server.registerActionHandler(this, actionHandler);
    }
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ models: pluginModels });
  }

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#authService = new AuthService(server, {
      jwtKey: server.config.jwtKey,
      userEntitySingularCode: this.#options.userEntitySingularCode,
      profilePropertyCodes: this.#options.profilePropertyCodes,
    });
    server.registerService("authService", this.#authService);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({ routes: pluginRoutes });
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
        throw new Error("AUTHORIZATION_HEADER_INVALID");
      }

      token = authHeader.slice(7);
    } else {
      token = request.cookies[server.config.sessionCookieName];
    }

    try {
      const secretKey = Buffer.from(server.config.jwtKey, "base64");
      const tokenPayload = verifyJwt(token, secretKey);
      routeContext.state.userId = Number(tokenPayload.aud as string);
      routeContext.state.userLogin = tokenPayload.act as string;
    } catch (error) {
      const logger = server.getLogger();
      logger.debug("Verify JWT failed.", { error });
    }
  }
}

export default AuthPlugin;
