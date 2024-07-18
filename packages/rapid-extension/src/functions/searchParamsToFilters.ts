import type { FunctionMeta } from "@ruiapp/move-style";
import { isArray, isEmpty, isNull, isUndefined, map } from "lodash";
import { SearchFormFilterConfiguration } from "../types/rapid-entity-types";
import moment from "moment";

export const searchParamsToFilters = (filterConfigurations: SearchFormFilterConfiguration[], searchParams: Record<string, any>) => {
  const filters: any[] = [];

  for (const filterConfig of filterConfigurations) {
    const paramValue = searchParams[filterConfig.code];
    if (isNull(paramValue) || isUndefined(paramValue) || (isArray(paramValue) && isEmpty(paramValue))) {
      continue;
    }

    const filterMode = filterConfig.filterMode || "eq";
    let filterFields = filterConfig.filterFields || [filterConfig.code];
    if (!filterFields.length) {
      filterFields = [filterConfig.code];
    }

    if (filterFields.length === 1) {
      if (filterMode === "range") {
        const { rangeUnit } = filterConfig.filterConfig || {};

        if (!isArray(paramValue)) {
          continue;
        }

        filters.push({
          field: filterFields[0],
          operator: "gte",
          value: paramValue[0] && rangeUnit ? moment(paramValue[0]).startOf(rangeUnit) : paramValue[0],
        });
        filters.push({
          field: filterFields[0],
          operator: "lte",
          value: paramValue[1] && rangeUnit ? moment(paramValue[1]).endOf(rangeUnit) : paramValue[1],
        });
      } else {
        filters.push({
          field: filterFields[0],
          operator: filterMode,
          value: paramValue,
        });
      }
    } else {
      filters.push({
        operator: "or",
        filters: map(filterFields, (filterField) => {
          return {
            field: filterField,
            operator: filterMode,
            value: paramValue,
          };
        }),
      });
    }
  }

  return filters;
};

export default {
  name: "searchParamsToFilters",
  func: searchParamsToFilters,
} as FunctionMeta;
