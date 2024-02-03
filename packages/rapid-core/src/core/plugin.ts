import { IPluginInstance } from "~/types";

export default class Plugin implements IPluginInstance {
  #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  getName() {
    return this.#name;
  }
}
