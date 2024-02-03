import { RpdDataModelProperty } from "../types";

export function isRelationProperty(property: RpdDataModelProperty) {
  return property.type === "relation" || property.type === "relation[]";
}
