import type { FunctionMeta } from "@ruiapp/move-style";
import { forEach, isArray, isEmpty, isNull, isString, isUndefined, map } from "lodash";
import { SearchFormFilterConfiguration } from "../types/rapid-entity-types";
import moment from "moment";
import { FilterFieldConfig } from "../mod";

export const searchParamsToFilters = (filterConfigurations: SearchFormFilterConfiguration[], searchParams: Record<string, any>) => {
  const filters: any[] = [];

  for (const filterConfig of filterConfigurations) {
    let paramValue = searchParams[filterConfig.code];
    if (isString(paramValue)) {
      paramValue = paramValue.trim();
    }
    if (isNull(paramValue) || isUndefined(paramValue) || ((isString(paramValue) || isArray(paramValue)) && isEmpty(paramValue))) {
      continue;
    }

    if (isArray(filterConfig.filters) && !isEmpty(filterConfig.filters)) {
      filters.push(...parseConfigToFilters(filterConfig.filters, paramValue));
    } else {
      const filterMode = filterConfig.filterMode || "eq";
      let filterFields = filterConfig.filterFields || [filterConfig.code];
      if (!filterFields.length) {
        filterFields = [filterConfig.code];
      }

      const filterConfigs = map(filterFields, (f) =>
        isString(f) ? { field: f, operator: filterMode, itemType: filterConfig.itemType, extra: filterConfig.filterExtra } : f,
      );
      filters.push(...parseConfigToFilters(filterConfigs, paramValue));
    }
  }

  return filters;
};

export default {
  name: "searchParamsToFilters",
  func: searchParamsToFilters,
} as FunctionMeta;

export function parseConfigToFilters(filterConfigs: FilterFieldConfig[], value: any) {
  let filters: any[] = [];

  forEach(filterConfigs, (filterConfig) => {
    if (filterConfig.filters && !isEmpty(filterConfig.filters)) {
      filters.push({
        field: filterConfig.field,
        operator: filterConfig.operator,
        filters: parseConfigToFilters(filterConfig.filters, value),
      });
      return;
    }

    if (filterConfig.operator === "range" || filterConfig.operator === "between") {
      const { rangeUnit } = filterConfig.extra || {};

      if (!isArray(value) && value.length != 2) {
        throw new Error(`Filter config operator '${filterConfig.operator}' need two values.`);
      }

      let beginValue = value[0];
      if (rangeUnit && beginValue) {
        beginValue = moment(beginValue).startOf(rangeUnit);
      }
      let endValue = value[1];
      if (rangeUnit && endValue) {
        endValue = moment(endValue).startOf(rangeUnit);
      }

      if (filterConfig.operator === "range") {
        if (rangeUnit === "day") {
          if (endValue) {
            endValue = moment(endValue).add(1, "day");
          }
        }
      }

      value = [beginValue, endValue];
    }

    filters.push({
      field: filterConfig.field,
      operator: filterConfig.operator,
      itemType: filterConfig.itemType,
      value: (filterConfig as any).value || value,
    });
  });

  return filters;
}
