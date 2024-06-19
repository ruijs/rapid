import { EventEmitter } from "events";

export default class EventManager<EventTypes extends Record<string, any[]>> {
  #eventEmitter: EventEmitter;

  constructor() {
    this.#eventEmitter = new EventEmitter();
  }

  on<K extends keyof EventTypes>(eventName: K, listener: (...args: EventTypes[K]) => void) {
    this.#eventEmitter.on(eventName as string, listener);
  }

  async emit<K extends keyof EventTypes>(eventName: K, ...args: EventTypes[K]) {
    const listeners = this.#eventEmitter.listeners(eventName as string);
    for (const listener of listeners) {
      await listener(...args);
    }
  }
}
