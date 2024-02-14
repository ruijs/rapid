import { IRpdServer } from "~/core/server";
import { RpdServerEventTypes } from "~/types";

export interface EntityWatcher<TEventName extends keyof RpdServerEventTypes> {
  eventName: TEventName;
  modelSingularCode: string;
  handler: EntityWatchHandler<TEventName>;
}

export type EntityWatchHandler<TEventName extends keyof RpdServerEventTypes> = (ctx: EntityWatchHandlerContext<TEventName>) => Promise<void>;

export type EntityWatchHandlerContext<TEventName extends keyof RpdServerEventTypes> = {
  server: IRpdServer;
  payload: RpdServerEventTypes[TEventName][1];
}

export interface EntityWatchPluginInitOptions {
  watchers: EntityWatcher<keyof RpdServerEventTypes>[];
}