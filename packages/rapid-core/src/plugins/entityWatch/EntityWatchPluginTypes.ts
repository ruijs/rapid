import { IRpdServer } from "~/core/server";
import { RpdServerEventTypes } from "~/types";

export type EntityWatcherType =
  | EntityWatcher<"entity.create">
  | EntityWatcher<"entity.update">
  | EntityWatcher<"entity.delete">
  | EntityWatcher<"entity.addRelations">
  | EntityWatcher<"entity.removeRelations">
  | EntityWatcher<any>
  ;

export interface EntityWatcher<TEventName extends keyof RpdServerEventTypes = any> {
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
  watchers: EntityWatcherType[];
}