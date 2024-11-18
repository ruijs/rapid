import { FacilityFactory } from "~/core/facility";
import { IRpdServer } from "~/core/server";
import MemoryCache from "./MemoryCache";

export default class CacheFactory implements FacilityFactory {
  readonly name: string;

  constructor() {
    this.name = "cache";
  }

  async createFacility(server: IRpdServer, options?: any) {
    return new MemoryCache();
  }
}
