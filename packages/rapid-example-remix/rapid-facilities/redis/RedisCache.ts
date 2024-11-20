import { Cache, IRpdServer, SetValueOptions } from "@ruiapp/rapid-core";
import { isString } from "lodash";
import type { RedisClientType } from "redis";

function getExpireAt(options?: SetValueOptions) {
  let expireAt = -1;
  if (options && options.ttl && options.ttl > 0) {
    expireAt = new Date().valueOf() + options.ttl;
  }
  return expireAt;
}

export default class RedisCache implements Cache {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async #getRedisClient() {
    return this.#server.getFacility<RedisClientType>("redis");
  }

  async set(key: string, value: string, options?: SetValueOptions) {
    const expireAt = getExpireAt(options);

    const redisClient = await this.#getRedisClient();
    await redisClient.set(key, value, {
      PXAT: expireAt,
    });
  }

  async setObject(key: string, value: Record<string, any>, options?: SetValueOptions) {
    const expireAt = getExpireAt(options);

    const redisClient = await this.#getRedisClient();
    await redisClient.set(key, JSON.stringify(value), {
      PXAT: expireAt,
    });
  }

  async get(key: string) {
    const redisClient = await this.#getRedisClient();
    const value = await redisClient.get(key);
    return value;
  }

  async getObject(key: string) {
    const redisClient = await this.#getRedisClient();
    const value = await redisClient.get(key);
    if (isString(value)) {
      return JSON.parse(value);
    }

    return null;
  }

  async del(key: string) {
    const redisClient = await this.#getRedisClient();
    await redisClient.del(key);
  }
}
