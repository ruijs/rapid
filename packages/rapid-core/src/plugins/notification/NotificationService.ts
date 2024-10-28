import { IRpdServer } from "~/core/server";
import { SendNotificationOptions, RpdNotification } from "./NotificationPluginTypes";
import { RouteContext } from "~/core/routeContext";

export default class NotificationService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async sendNotification(routeContext: RouteContext, server: IRpdServer, options: SendNotificationOptions): Promise<RpdNotification> {
    const notificationManager = server.getEntityManager("notification");

    return await notificationManager.createEntity({
      routeContext,
      entity: {
        title: options.title,
        content: options.content,
        details: options.details,
        user: options.userId,
      },
    });
  }
}
