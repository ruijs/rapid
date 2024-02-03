import { RpdApplicationConfig } from "~/types";
import Plugin from "./plugin";
import * as metaManager from "~/plugins/metaManager/mod";
import * as dataManager from "~/plugins/dataManager/mod";
import * as routeManager from "~/plugins/routeManager/mod";
import * as webhooks from "~/plugins/webhooks/mod";
import * as authManager from "~/plugins/authManager/mod";
import { IRpdServer, IRpdServerPlugin } from "./server";

const plugins: IRpdServerPlugin[] = [];

export async function loadPlugins() {
  plugins.push(metaManager);
  plugins.push(dataManager);
  plugins.push(routeManager);
  plugins.push(webhooks);
  plugins.push(authManager);
}

/** 初始化插件时调用。 */
export async function initPlugins(server: IRpdServer) {
  for (const plugin of plugins) {
    const pluginInstance = new Plugin(plugin.code);
    await plugin.initPlugin(pluginInstance, server);
  }
}

/** 注册中间件 */
export async function registerMiddlewares(server: IRpdServer) {
  for (const plugin of plugins) {
    if (plugin.registerMiddlewares) {
      await plugin.registerMiddlewares(server);
    }
  }
}

/** 注册接口动作处理程序 */
export async function registerHttpHandlers(server: IRpdServer) {
  for (const plugin of plugins) {
    if (plugin.registerHttpHandlers) {
      await plugin.registerHttpHandlers(server);
    }
  }
}

/** 注册事件处理程序 */
export async function registerEventHandlers(server: IRpdServer) {
  for (const plugin of plugins) {
    if (plugin.registerEventHandlers) {
      await plugin.registerEventHandlers(server);
    }
  }
}

/** 注册消息处理程序 */
export async function registerMessageHandlers(server: IRpdServer) {
  for (const plugin of plugins) {
    if (plugin.registerMessageHandlers) {
      await plugin.registerMessageHandlers(server);
    }
  }
}

/** 注册任务处理程序 */
export async function registerTaskProcessors(server: IRpdServer) {
  for (const plugin of plugins) {
    if (plugin.registerTaskProcessors) {
      await plugin.registerTaskProcessors(server);
    }
  }
}

/** 在加载应用前调用。 */
export async function onLoadingApplication(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  for (const plugin of plugins) {
    if (plugin.onLoadingApplication) {
      await plugin.onLoadingApplication(server, applicationConfig);
    }
  }
}

/** 配置数据模型 */
export async function configureModels(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  for (const plugin of plugins) {
    if (plugin.configureModels) {
      await plugin.configureModels(server, applicationConfig);
    }
  }
}

/** 配置模型属性 */
export async function configureModelProperties(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  for (const plugin of plugins) {
    if (plugin.configureModelProperties) {
      await plugin.configureModelProperties(server, applicationConfig);
    }
  }
}

/** 配置路由 */
export async function configureRoutes(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  for (const plugin of plugins) {
    if (plugin.configureRoutes) {
      await plugin.configureRoutes(server, applicationConfig);
    }
  }
}

/** 在应用配置加载完成后调用。此时插件可以进行一些数据的初始化工作。 */
export async function onApplicationLoaded(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  for (const plugin of plugins) {
    if (plugin.onApplicationLoaded) {
      await plugin.onApplicationLoaded(server, applicationConfig);
    }
  }
}

/** 在应用准备完成后调用。此时服务器已经可以处理网络请求。 */
export async function onApplicationReady(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  for (const plugin of plugins) {
    if (plugin.onApplicationReady) {
      await plugin.onApplicationReady(server, applicationConfig);
    }
  }
}
