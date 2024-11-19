import MemoryCache from "./MemoryCache";
import { CacheProvider } from "./CacheFacilityTypes";
import { IRpdServer } from "~/core/server";

export default class MemoryCacheProvider implements CacheProvider {
  readonly providerName: string;

  constructor() {
    this.providerName = "memory";
  }

  async createCache(server: IRpdServer) {
    return new MemoryCache();
  }
}
