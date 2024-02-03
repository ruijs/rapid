/**
 * Webhooks plugin
 */

import * as _ from "lodash";
import {
  IPluginInstance,
  RpdApplicationConfig,
  RpdEntityCreateEventPayload,
  RpdEntityDeleteEventPayload,
  RpdEntityUpdateEventPayload,
  RpdServerEventTypes,
} from "~/types";
import { RpdServerPluginExtendingAbilities, RpdServerPluginConfigurableTargetOptions, RpdConfigurationItemOptions, IRpdServer } from "~/core/server";
import { fetchWithTimeout } from "~/utilities/httpUtility";
import { findEntities } from "~/dataAccess/entityManager";
import pluginConfig from "./pluginConfig";

export const code = "webhooks";
export const description = "webhooks";
export const extendingAbilities: RpdServerPluginExtendingAbilities[] = [];
export const configurableTargets: RpdServerPluginConfigurableTargetOptions[] = [];
export const configurations: RpdConfigurationItemOptions[] = [];

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

let _plugin: IPluginInstance;
let webhooks: Webhook[];

export async function initPlugin(plugin: IPluginInstance, server: IRpdServer) {
  _plugin = plugin;
}

export async function configureModels(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  for (const model of pluginConfig.models) {
    applicationConfig.models.push(model);
  }
}

export async function registerEventHandlers(server: IRpdServer) {
  const events: (keyof RpdServerEventTypes)[] = [
    "entity.create",
    "entity.update",
    "entity.delete",
  ];
  for (const event of events) {
    server.registerEventHandler(
      event,
      handleEntityEvent.bind(null, server, event),
    );
  }
}

async function handleEntityEvent(
  server: IRpdServer,
  event: keyof RpdServerEventTypes,
  sender: IPluginInstance,
  payload:
    | RpdEntityCreateEventPayload
    | RpdEntityUpdateEventPayload
    | RpdEntityDeleteEventPayload,
) {
  if (sender === _plugin) {
    return;
  }

  if (payload.namespace === "sys" && payload.modelSingularCode === "webhook") {
    webhooks = await listWebhooks(server);
    return;
  }

  // We will not trigger webhooks if entity changed is in "meta" or "sys" namespaces.
  if (payload.namespace === "meta" || payload.namespace === "sys") {
    return;
  }

  for (const webhook of webhooks) {
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

export async function onApplicationLoaded(
  server: IRpdServer,
  applicationConfig: RpdApplicationConfig,
) {
  console.log("[webhooks.onApplicationLoaded] loading webhooks");
  webhooks = await listWebhooks(server);
}

function listWebhooks(
  server: IRpdServer,
) {
  const dataAccessor = server.getDataAccessor({
    namespace: "sys",
    singularCode: "webhook",
  });

  return findEntities(server, dataAccessor, {
    filters: [
      {
        field: "enabled",
        operator: "eq",
        value: true,
      },
    ],
  });
}
