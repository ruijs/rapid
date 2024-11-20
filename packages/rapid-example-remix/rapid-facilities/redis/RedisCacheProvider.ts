import { CacheProvider, IRpdServer } from "@ruiapp/rapid-core";
import RedisCache from "./RedisCache";

export default class RedisCacheProvider implements CacheProvider {
  readonly providerName: string;

  constructor() {
    this.providerName = "redis";
  }

  async createCache(server: IRpdServer) {
    return new RedisCache(server);
  }
}
