/**
 * Webhooks plugin
 */

import { RpdApplicationConfig, RpdEntityCreateEventPayload, RpdEntityDeleteEventPayload, RpdEntityUpdateEventPayload, RpdServerEventTypes } from "~/types";
import {
  RpdServerPluginExtendingAbilities,
  RpdServerPluginConfigurableTargetOptions,
  RpdConfigurationItemOptions,
  IRpdServer,
  RapidPlugin,
} from "~/core/server";
import { fetchWithTimeout } from "~/utilities/httpUtility";
import pluginConfig from "./pluginConfig";
import { indexOf } from "lodash";

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

function listWebhooks(server: IRpdServer) {
  const logger = server.getLogger();
  logger.info("Loading meta of webhooks...");

  try {
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
  } catch (error) {
    logger.crit("Failed to load meta of webhooks.", { error });
  }
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

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    const events: (keyof RpdServerEventTypes)[] = ["entity.create", "entity.update", "entity.delete"];
    for (const event of events) {
      server.registerEventHandler(event, this.handleEntityEvent.bind(this, server, event));
    }
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    server.appendApplicationConfig({
      models: pluginConfig.models,
    });
  }

  async configureModelProperties(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async configureRoutes(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#webhooks = await listWebhooks(server);
  }

  async onApplicationReady(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {}

  async handleEntityEvent(
    server: IRpdServer,
    event: keyof RpdServerEventTypes,
    sender: RapidPlugin,
    payload: RpdEntityCreateEventPayload | RpdEntityUpdateEventPayload | RpdEntityDeleteEventPayload,
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

    const logger = server.getLogger();

    for (const webhook of this.#webhooks) {
      if (indexOf(webhook.events, event) === -1) {
        continue;
      }

      if (webhook.namespace != payload.namespace || webhook.modelSingularCode !== payload.modelSingularCode) {
        continue;
      }

      logger.debug(`Triggering webhook. ${webhook.url}`);
      // TODO: It's better to trigger webhook through message queue.
      const requestBody = { event, payload };
      try {
        await fetchWithTimeout(webhook.url, {
          method: "post",
          headers: {
            "Content-Type": "application/json",
            "x-webhook-secret": webhook.secret || "",
          },
          body: JSON.stringify(requestBody),
        });
      } catch (error) {
        logger.error("Failed to call webhook.", { error, webhookUrl: webhook.url, requestBody });
      }
    }
  }
}

export default WebhooksPlugin;
