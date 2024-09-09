import { RapidTableSelectRockConfig } from "../rapid-table-select/rapid-table-select-types";

export interface EntityTableSelectRockConfig extends Omit<RapidTableSelectRockConfig, "requestConfig"> {
  entityCode: string;
  requestParams?: RapidTableSelectRockConfig["requestConfig"]["params"];
}
