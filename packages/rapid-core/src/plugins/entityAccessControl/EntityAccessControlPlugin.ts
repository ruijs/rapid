import type { RpdApplicationConfig, RpdDataModelProperty } from "~/types";

import { IRpdServer, RapidPlugin, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";
import { find, set } from "lodash";
import { ActionHandlerContext } from "~/core/actionHandler";
import { isAccessAllowed } from "~/utilities/accessControlUtility";
import { RouteContext } from "~/core/routeContext";

class EntityAccessControlPlugin implements RapidPlugin {
  constructor() {}

  get code(): string {
    return "entityAccessControl";
  }

  get description(): string {
    return "";
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

  async onLoadingApplication(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    const properties: RpdDataModelProperty[] = [
      {
        name: "permissionPolicies",
        code: "permissionPolicies",
        columnName: "permission_policies",
        type: "json",
      },
    ];
    server.appendModelProperties("model", properties);
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    const logger = server.getLogger();
    logger.info("Configuring entity access checking policies...");

    const model = find(applicationConfig.models, (item) => item.singularCode === "model");
    if (!model) {
      return;
    }

    const { permissionPolicies } = model;
    if (!permissionPolicies) {
      return;
    }

    const routes = applicationConfig.routes;
    for (const route of routes) {
      const { actions } = route;
      if (!actions) {
        continue;
      }

      for (const action of route.actions) {
        if (action.code === "findCollectionEntityById") {
          if (permissionPolicies.find) {
            set(action, "config.permissionPolicy", permissionPolicies.find);
          }
        }
      }
    }
  }

  async onPrepareRouteContext(server: IRpdServer, routeContext: RouteContext) {
    const userId = routeContext.state.userId;
    if (!userId) {
      return;
    }

    const actions = await server.queryDatabaseObject(
      `select distinct a.* from sys_actions a
      inner join oc_role_sys_action_links ra on a.id = ra.action_id
      inner join oc_role_user_links ru on ru.role_id = ra.role_id
      where ru.user_id = $1;`,
      [userId],
    );
    routeContext.state.allowedActions = actions.map((item) => item.code);
  }

  async beforeRunRouteActions(server: IRpdServer, handlerContext: ActionHandlerContext): Promise<any> {
    // Check permission
    const { routerContext } = handlerContext;
    const { routeConfig } = routerContext;
    for (const actionConfig of routeConfig.actions) {
      const permissionPolicy = actionConfig.config?.permissionPolicy;
      if (permissionPolicy) {
        if (!isAccessAllowed(permissionPolicy, routerContext.state.allowedActions || [])) {
          throw new Error(`Your action of '${actionConfig.code}' is not permitted.`);
        }
      }
    }
  }
}

export default EntityAccessControlPlugin;
