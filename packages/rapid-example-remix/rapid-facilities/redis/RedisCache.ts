import { Cache, IRpdServer, SetValueOptions } from "@ruiapp/rapid-core";
import { isString } from "lodash";
import type { RedisClientType } from "redis";

export default class RedisCache implements Cache {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async set(key: string, value: any, options?: SetValueOptions) {
    let expireAt = -1;
    if (options && options.ttl && options.ttl > 0) {
      expireAt = new Date().valueOf() + options.ttl;
    }

    const redisClient = await this.#server.getFacility<RedisClientType>("redis");
    await redisClient.set(key, JSON.stringify(value), {
      PXAT: expireAt,
    });
  }

  async get(key: string) {
    const redisClient = await this.#server.getFacility<RedisClientType>("redis");
    const value = await redisClient.get(key);
    if (isString(value)) {
      return JSON.parse(value);
    }

    return undefined;
  }

  async del(key: string) {
    const redisClient = await this.#server.getFacility<RedisClientType>("redis");
    await redisClient.del(key);
  }
}
