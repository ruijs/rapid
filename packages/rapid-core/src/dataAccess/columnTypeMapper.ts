import { RpdDataPropertyTypes } from "~/types";
import { DataAccessPgColumnTypes } from "./dataAccessTypes";

export const pgPropertyTypeColumnMap: Record<Exclude<RpdDataPropertyTypes, "relation" | "relation[]">, DataAccessPgColumnTypes> = {
  integer: "int4",
  long: "int8",
  float: "float4",
  double: "float8",
  decimal: "decimal",
  text: "text",
  boolean: "bool",
  date: "date",
  time: "time",
  datetime: "timestamptz",
  json: "jsonb",
  option: "text",
  file: "jsonb",
  "file[]": "jsonb",
  image: "jsonb",
  "image[]": "jsonb",
};
