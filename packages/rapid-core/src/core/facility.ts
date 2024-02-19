import { IRpdServer } from "./server";

export interface FacilityFactory {
  name: string;

  createFacility: (server: IRpdServer, options?: any) => Promise<any>;
}