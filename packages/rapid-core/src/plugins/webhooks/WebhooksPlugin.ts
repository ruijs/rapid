/**
 * Webhooks plugin
 */

import * as _ from "lodash";
import {
  RpdApplicationConfig,
  RpdEntityCreateEventPayload,
  RpdEntityDeleteEventPayload,
  RpdEntityUpdateEventPayload,
  RpdServerEventTypes,
} from "~/types";
import { RpdServerPluginExtendingAbilities, RpdServerPluginConfigurableTargetOptions, RpdConfigurationItemOptions, IRpdServer, RapidPlugin } from "~/core/server";
import { fetchWithTimeout } from "~/utilities/httpUtility";
import pluginConfig from "./pluginConfig";


export interface Webhook {
  name: string;
  url: string;
  secret: string;
  namespace: string;
  modelSingularCode: string;
  events: string[];
  properties: string[];
  enabled: boolean;
}


function listWebhooks(
  server: IRpdServer,
) {
  const entityManager = server.getEntityManager("webhook");
  return entityManager.findEntities({
    filters: [
      {
        field: "enabled",
        operator: "eq",
        value: true,
      },
    ],
  });
}


class WebhooksPlugin implements RapidPlugin {
  #webhooks: Webhook[];

  constructor() {
    this.#webhooks = [];
  }

  get code(): string {
    return "webhooks";
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
  }

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    const events: (keyof RpdServerEventTypes)[] = [
      "entity.create",
      "entity.update",
      "entity.delete",
    ];
    for (const event of events) {
      server.registerEventHandler(
        event,
        this.handleEntityEvent.bind(this, server, event),
      );
    }
  }

  async registerMessageHandlers(server: IRpdServer): Promise<any> {
  }

  async registerTaskProcessors(server: IRpdServer): Promise<any> {
  }

  async onLoadingApplication(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({
      models: pluginConfig.models,
    });
  }

  async configureModelProperties(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    console.log("[webhooks.onApplicationLoaded] loading webhooks");
    this.#webhooks = await listWebhooks(server);
  }

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
  }

  async handleEntityEvent(
    server: IRpdServer,
    event: keyof RpdServerEventTypes,
    sender: RapidPlugin,
    payload:
      | RpdEntityCreateEventPayload
      | RpdEntityUpdateEventPayload
      | RpdEntityDeleteEventPayload,
  ) {
    if (sender === this) {
      return;
    }

    if (payload.namespace === "sys" && payload.modelSingularCode === "webhook") {
      this.#webhooks = await listWebhooks(server);
      return;
    }

    // We will not trigger webhooks if entity changed is in "meta" or "sys" namespaces.
    if (payload.namespace === "meta" || payload.namespace === "sys") {
      return;
    }

    for (const webhook of this.#webhooks) {
      if (_.indexOf(webhook.events, event) === -1) {
        continue;
      }

      if (
        webhook.namespace != payload.namespace ||
        webhook.modelSingularCode !== payload.modelSingularCode
      ) {
        continue;
      }

      console.debug(`Triggering webhook. ${webhook.url}`);
      // TODO: It's better to trigger webhook through message queue.
      try {
        await fetchWithTimeout(webhook.url, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-secret": webhook.secret || "",
          },
          body: JSON.stringify({ event, payload }),
        });
      } catch (err) {
        console.warn(new Error("Failed to call webhook. " + err.message));
        console.warn(err);
      }
    }
  }
}

export default WebhooksPlugin;
