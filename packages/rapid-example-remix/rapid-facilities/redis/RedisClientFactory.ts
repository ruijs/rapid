import { FacilityFactory, IRpdServer } from "@ruiapp/rapid-core";
import { createClient, RedisClientOptions, RedisClientType } from "redis";

export default class RedisClientFactory implements FacilityFactory<RedisClientType, RedisClientOptions> {
  readonly name: string;
  #options?: RedisClientOptions;
  #client?: RedisClientType;

  constructor(options?: RedisClientOptions) {
    this.name = "redis";
    this.#options = options;
  }

  async createFacility(server: IRpdServer, options?: RedisClientOptions) {
    if (!this.#client) {
      this.#client = createClient({ ...this.#options, ...options }) as RedisClientType;
      await this.#client.connect();
    }

    return this.#client;
  }
}
