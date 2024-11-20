import { IRpdServer } from "~/core/server";

export interface CacheFactoryConfig {
  providers?: CacheProvider[];
}

export interface CacheProvider {
  providerName: string;
  createCache: (server: IRpdServer) => Promise<Cache>;
}

export interface Cache {
  set: (key: string, value: string, options?: SetValueOptions) => Promise<void>;
  setObject: (key: string, value: Record<string, any>, options?: SetValueOptions) => Promise<void>;
  get: (key: string) => Promise<string | null>;
  getObject: (key: string) => Promise<Record<string, any> | null>;
  del: (key: string) => Promise<void>;
}

export interface SetValueOptions {
  /**
   * Time-to-live, in milliseconds
   */
  ttl?: number;
}

export interface CreateCacheFacilityOptions {
  providerName: string;
}
