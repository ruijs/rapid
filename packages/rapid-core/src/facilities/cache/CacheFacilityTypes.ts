export interface CacheProvider {
  set: (key: string, value: any, options?: SetValueOptions) => Promise<void>;
  get: (key: string) => Promise<any>;
  del: (key: string) => Promise<void>;
}

export interface SetValueOptions {
  /**
   * Time-to-live, in milliseconds
   */
  ttl?: number;
}
