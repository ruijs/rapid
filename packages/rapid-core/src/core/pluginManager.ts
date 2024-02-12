import { RpdApplicationConfig } from "~/types";
import { IRpdServer, RapidPlugin } from "./server";

class PluginManager {
  #server: IRpdServer;
  #plugins: RapidPlugin[];

  constructor(server: IRpdServer) {
    this.#server = server;
    this.#plugins = [];
  }

  async loadPlugins(plugins: RapidPlugin[]) {
    for(const plugin of plugins) {
      this.#plugins.push(plugin);
    }
  }

  /** 初始化插件时调用。 */
  async initPlugins() {
    for (const plugin of this.#plugins) {
      await plugin.initPlugin(this.#server);
    }
  }

  /** 注册中间件 */
  async registerMiddlewares() {
    for (const plugin of this.#plugins) {
      if (plugin.registerMiddlewares) {
        await plugin.registerMiddlewares(this.#server);
      }
    }
  }

  /** 注册接口动作处理程序 */
  async registerActionHandlers() {
    for (const plugin of this.#plugins) {
      if (plugin.registerActionHandlers) {
        await plugin.registerActionHandlers(this.#server);
      }
    }
  }

  /** 注册事件处理程序 */
  async registerEventHandlers() {
    for (const plugin of this.#plugins) {
      if (plugin.registerEventHandlers) {
        await plugin.registerEventHandlers(this.#server);
      }
    }
  }

  /** 注册消息处理程序 */
  async registerMessageHandlers() {
    for (const plugin of this.#plugins) {
      if (plugin.registerMessageHandlers) {
        await plugin.registerMessageHandlers(this.#server);
      }
    }
  }

  /** 注册任务处理程序 */
  async registerTaskProcessors() {
    for (const plugin of this.#plugins) {
      if (plugin.registerTaskProcessors) {
        await plugin.registerTaskProcessors(this.#server);
      }
    }
  }

  /** 在加载应用前调用。 */
  async onLoadingApplication(
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) {
    for (const plugin of this.#plugins) {
      if (plugin.onLoadingApplication) {
        await plugin.onLoadingApplication(server, applicationConfig);
      }
    }
  }

  /** 配置数据模型 */
  async configureModels(
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) {
    for (const plugin of this.#plugins) {
      if (plugin.configureModels) {
        await plugin.configureModels(server, applicationConfig);
      }
    }
  }

  /** 配置模型属性 */
  async configureModelProperties(
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) {
    for (const plugin of this.#plugins) {
      if (plugin.configureModelProperties) {
        await plugin.configureModelProperties(server, applicationConfig);
      }
    }
  }

  /** 配置路由 */
  async configureRoutes(
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) {
    for (const plugin of this.#plugins) {
      if (plugin.configureRoutes) {
        await plugin.configureRoutes(server, applicationConfig);
      }
    }
  }

  /** 在应用配置加载完成后调用。此时插件可以进行一些数据的初始化工作。 */
  async onApplicationLoaded(
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) {
    for (const plugin of this.#plugins) {
      if (plugin.onApplicationLoaded) {
        await plugin.onApplicationLoaded(server, applicationConfig);
      }
    }
  }

  /** 在应用准备完成后调用。此时服务器已经可以处理网络请求。 */
  async onApplicationReady(
    server: IRpdServer,
    applicationConfig: RpdApplicationConfig,
  ) {
    for (const plugin of this.#plugins) {
      if (plugin.onApplicationReady) {
        await plugin.onApplicationReady(server, applicationConfig);
      }
    }
  }
}

export default PluginManager;