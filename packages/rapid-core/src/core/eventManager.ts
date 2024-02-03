import { EventEmitter } from "events";
import { RpdServerEventTypes as EventTypes } from "~/types";

export default class EventManager {
  #eventEmitter: EventEmitter;

  constructor() {
    this.#eventEmitter = new EventEmitter();
  }

  on<K extends keyof EventTypes>(
    eventName: K,
    listener: (...args: EventTypes[K]) => void,
  ) {
    this.#eventEmitter.on(eventName, listener);
  }

  emit<K extends keyof EventTypes>(eventName: K, ...args: EventTypes[K]) {
    return this.#eventEmitter.emit(eventName, ...args);
  }
}
