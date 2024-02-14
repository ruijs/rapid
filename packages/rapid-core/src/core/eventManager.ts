import { EventEmitter } from "events";

export default class EventManager<EventTypes extends Record<string, any[]>> {
  #eventEmitter: EventEmitter;

  constructor() {
    this.#eventEmitter = new EventEmitter();
  }

  on<K extends keyof EventTypes>(
    eventName: K,
    listener: (...args: EventTypes[K]) => void,
  ) {
    this.#eventEmitter.on(eventName as string, listener);
  }

  emit<K extends keyof EventTypes>(eventName: K, ...args: EventTypes[K]) {
    return this.#eventEmitter.emit(eventName as string, ...args);
  }
}
