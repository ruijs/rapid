import type { RpdEntityCreateEventPayload, RpdServerEventTypes } from "~/types";
import { IRpdServer, RapidPlugin, RpdConfigurationItemOptions, RpdServerPluginConfigurableTargetOptions, RpdServerPluginExtendingAbilities } from "~/core/server";
import { EntityWatchHandlerContext, EntityWatchPluginInitOptions } from "./EntityWatchPluginTypes";
import EventManager from "~/core/eventManager";

class EntityWatchPlugin implements RapidPlugin {
  #createEventEmitters: EventManager<Record<string, [EntityWatchHandlerContext<any>]>>;
  #updateEventEmitters: EventManager<Record<string, [EntityWatchHandlerContext<any>]>>;
  #deleteEventEmitters: EventManager<Record<string, [EntityWatchHandlerContext<any>]>>;
  #addRelationsEventEmitters: EventManager<Record<string, [EntityWatchHandlerContext<any>]>>;
  #removeRelationsEventEmitters: EventManager<Record<string, [EntityWatchHandlerContext<any>]>>;

  constructor(options: EntityWatchPluginInitOptions) {
    const { watchers } = options;

    this.#createEventEmitters = new EventManager();
    this.#updateEventEmitters = new EventManager();
    this.#deleteEventEmitters = new EventManager();
    this.#addRelationsEventEmitters = new EventManager();
    this.#removeRelationsEventEmitters = new EventManager();

    for (const watcher of watchers) {
      if (watcher.eventName === "entity.create") {
        this.#createEventEmitters.on(watcher.modelSingularCode, watcher.handler);
      } else if (watcher.eventName === "entity.update") {
        this.#updateEventEmitters.on(watcher.modelSingularCode, watcher.handler);
      } else if (watcher.eventName === "entity.delete") {
        this.#deleteEventEmitters.on(watcher.modelSingularCode, watcher.handler);
      } else if (watcher.eventName === "entity.addRelations") {
        this.#addRelationsEventEmitters.on(watcher.modelSingularCode, watcher.handler);
      } else if (watcher.eventName === "entity.removeRelations") {
        this.#removeRelationsEventEmitters.on(watcher.modelSingularCode, watcher.handler);
      }
    }
  }

  get code(): string {
    return "entityWatch";
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

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    server.registerEventHandler("entity.create", this.handleEntityEvent.bind(this, server, "entity.create"));
    server.registerEventHandler("entity.update", this.handleEntityEvent.bind(this, server, "entity.update"));
    server.registerEventHandler("entity.delete", this.handleEntityEvent.bind(this, server, "entity.delete"));
    server.registerEventHandler("entity.addRelations", this.handleEntityEvent.bind(this, server, "entity.addRelations"));
    server.registerEventHandler("entity.removeRelations", this.handleEntityEvent.bind(this, server, "entity.removeRelations"));
  }

  handleEntityEvent(server: IRpdServer, eventName: keyof RpdServerEventTypes, sender: RapidPlugin, payload: RpdEntityCreateEventPayload) {
    if (sender === this) {
      return;
    }

    const { modelSingularCode } = payload;
    const entityWatchHandlerContext: EntityWatchHandlerContext<typeof eventName> = {
      server,
      payload,
    };

    if (eventName === "entity.create") {
      this.#createEventEmitters.emit(modelSingularCode, entityWatchHandlerContext);
    } else if (eventName === "entity.update") {
      this.#updateEventEmitters.emit(modelSingularCode, entityWatchHandlerContext);
    } else if (eventName === "entity.delete") {
      this.#deleteEventEmitters.emit(modelSingularCode, entityWatchHandlerContext);
    } else if (eventName === "entity.addRelations") {
      this.#addRelationsEventEmitters.emit(modelSingularCode, entityWatchHandlerContext);
    } else if (eventName === "entity.removeRelations") {
      this.#removeRelationsEventEmitters.emit(modelSingularCode, entityWatchHandlerContext);
    }
  }
}

export default EntityWatchPlugin;
