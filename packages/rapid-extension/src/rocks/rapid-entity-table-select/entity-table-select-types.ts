import { TableSelectRockConfig } from "../rapid-table-select/table-select-types";

export interface EntityTableSelectRockConfig extends Omit<TableSelectRockConfig, "requestConfig"> {
  entityCode: string;
  listDataFindOptions?: TableSelectRockConfig["requestConfig"]["params"];
}
