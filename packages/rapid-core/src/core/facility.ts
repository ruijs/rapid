import { IRpdServer } from "./server";

export interface FacilityFactory<TFacility = any, TCreateFacilityOptions = any> {
  name: string;

  createFacility: (server: IRpdServer, options?: TCreateFacilityOptions) => Promise<TFacility>;
}
