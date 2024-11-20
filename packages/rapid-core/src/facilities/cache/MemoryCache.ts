import { Cache, SetValueOptions } from "./CacheFacilityTypes";

export type MemoryCacheItem<TValue = any> = {
  value: TValue;
  expireAt: number;
};

const values: Map<string, MemoryCacheItem> = new Map();

async function set(key: string, value: any, options?: SetValueOptions) {
  let expireAt = -1;
  if (options && options.ttl > 0) {
    expireAt = new Date().valueOf() + options.ttl;
  }

  const cacheItem = {
    value,
    expireAt,
  };
  values.set(key, cacheItem);
}

async function get(key: string) {
  const cacheItem = values.get(key);
  if (cacheItem) {
    if (cacheItem.expireAt === -1) {
      return cacheItem.value;
    }

    if (cacheItem.expireAt >= new Date().valueOf()) {
      return cacheItem.value;
    }
  }

  return undefined;
}

export default class MemoryCache implements Cache {
  async set(key: string, value: string, options?: SetValueOptions) {
    await set(key, value, options);
  }

  async setObject(key: string, value: Record<string, any>, options?: SetValueOptions) {
    await set(key, value, options);
  }

  async get(key: string) {
    return get(key);
  }

  async getObject(key: string) {
    return get(key);
  }

  async del(key: string) {
    values.delete(key);
  }
}
