import { EntityFilterOptions, FindEntityExistenceFilterOptions, FindEntityLogicalFilterOptions } from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";

export function removeFiltersWithNullValue(filters?: EntityFilterOptions[]) {
  const result: EntityFilterOptions[] = [];
  if (!filters) {
    return result;
  }

  for (const filter of filters) {
    const { operator } = filter;

    switch (operator) {
      case "null":
      case "notNull":
        result.push(filter);
        break;
      case "exists":
      case "notExists":
      case "and":
      case "or":
        const transformedFilter = transformFilterWithSubFilters(filter);
        if (transformedFilter !== null) {
          result.push(transformedFilter);
        }
        break;
      default:
        if (!isNullOrUndefined(filter.value)) {
          result.push(filter);
        }
    }
  }

  return result;
}

function transformFilterWithSubFilters(filter: FindEntityExistenceFilterOptions | FindEntityLogicalFilterOptions): FindEntityExistenceFilterOptions | FindEntityLogicalFilterOptions | null {
  const subFilters = removeFiltersWithNullValue(filter.filters);
  if (!subFilters.length) {
    return null;
  }

  filter.filters = subFilters;
  return filter;
}
