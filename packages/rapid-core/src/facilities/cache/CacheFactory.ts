import { FacilityFactory } from "~/core/facility";
import { IRpdServer } from "~/core/server";
import { Cache, CacheProvider, CacheFactoryConfig, CreateCacheFacilityOptions } from "./CacheFacilityTypes";
import MemoryCacheProvider from "./MemoryCacheProvider";

export default class CacheFactory implements FacilityFactory<Cache, CreateCacheFacilityOptions> {
  readonly name: string;
  #providers: Map<string, CacheProvider>;

  constructor(config: CacheFactoryConfig) {
    this.name = "cache";

    const memoryCacheProvider = new MemoryCacheProvider();

    this.#providers = new Map();
    this.#providers.set(memoryCacheProvider.providerName, memoryCacheProvider);

    for (const provider of config.providers) {
      this.#providers.set(provider.providerName, provider);
    }
  }

  async createFacility(server: IRpdServer, options?: CreateCacheFacilityOptions) {
    const providerName = options?.providerName || "memory";
    const creator = this.#providers.get(providerName);
    if (!creator) {
      throw new Error(`Unkown cache provider name: ${providerName}`);
    }
    return creator.createCache(server);
  }
}
