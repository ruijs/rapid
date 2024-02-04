import * as _ from "lodash";
import {
  CountEntityOptions,
  DeleteEntityOptions,
  EntityFilterOptions,
  EntityFilterRelationalOperators,
  FindEntityLogicalFilterOptions,
  FindEntityOptions,
  FindEntityRelationalFilterOptions,
  FindEntityUnaryFilterOptions,
  CreateEntityOptions,
  RpdDataModel,
  RpdDataModelProperty,
  UpdateEntityOptions,
  FindEntitySetFilterOptions,
  QuoteTableOptions,
} from "../types";

const objLeftQuoteChar = '"';
const objRightQuoteChar = '"';

const relationalOperatorsMap = new Map<EntityFilterRelationalOperators, string>(
  [
    ["eq", "="],
    ["ne", "<>"],
    ["gt", ">"],
    ["gte", ">="],
    ["lt", "<"],
    ["lte", "<="],
  ],
);


export interface BuildQueryContext {
  builder: QueryBuilder;
  params: any[];
}

export interface InitQueryBuilderOptions {
  dbDefaultSchema: string;
}

export default class QueryBuilder {
  #dbDefaultSchema: string;

  constructor(options: InitQueryBuilderOptions) {
    this.#dbDefaultSchema = options.dbDefaultSchema;
  }

  quoteTable(options: QuoteTableOptions) {
    const { schema, tableName } = options;
    if (schema) {
      return `${this.quoteObject(schema)}.${this.quoteObject(tableName)}`;
    } else if (this.#dbDefaultSchema) {
      return `${this.quoteObject(this.#dbDefaultSchema)}.${this.quoteObject(tableName)}`;
    } else {
      return this.quoteObject(tableName);
    }
  }

  quoteObject(name: string) {
    return `${objLeftQuoteChar}${name}${objRightQuoteChar}`;
  }

  select(model: RpdDataModel, options: FindEntityOptions) {
    const ctx: BuildQueryContext = {
      builder: this,
      params: [],
    };
    let { properties, filters, orderBy, pagination } = options;
    let command = "SELECT ";
    if (!properties || !properties.length) {
      command += "* FROM ";
    } else {
      command += properties.map(this.quoteObject).join(", ");
      command += " FROM ";
    }

    command += this.quoteTable(model);

    if (filters && filters.length) {
      command += " WHERE ";
      command += buildFiltersQuery(ctx, filters);
    }

    if (orderBy && orderBy.length) {
      command += " ORDER BY ";
      command += orderBy.map((item) => {
        const quotedName = this.quoteObject(item.field);
        return item.desc ? quotedName + " DESC" : quotedName;
      }).join(", ");
    }

    if (pagination) {
      command += " OFFSET ";
      ctx.params.push(pagination.offset);
      command += "$" + ctx.params.length;

      command += " LIMIT ";
      ctx.params.push(pagination.limit);
      command += "$" + ctx.params.length;
    }

    return {
      command,
      params: ctx.params,
    };
  }

  count(model: RpdDataModel, options: CountEntityOptions) {
    const ctx: BuildQueryContext = {
      builder: this,
      params: [],
    };
    let { filters } = options;
    let command = 'SELECT COUNT(*)::int as "count" FROM ';

    command += this.quoteTable(model);

    if (filters && filters.length) {
      command += " WHERE ";
      command += buildFiltersQuery(ctx, filters);
    }

    return {
      command,
      params: ctx.params,
    };
  }

  insert(model: RpdDataModel, options: CreateEntityOptions) {
    const params: any[] = [];
    const ctx: BuildQueryContext = {
      builder: this,
      params,
    };
    const { entity } = options;
    let command = "INSERT INTO ";

    command += this.quoteTable(model);

    const propertyNames: string[] = Object.keys(entity);
    let values = "";
    propertyNames.forEach((propertyName, index) => {
      if (index) {
        values += ", ";
      }

      let property: RpdDataModelProperty | null = null;
      if (model) {
        property = _.find(
          model.properties,
          (e: RpdDataModelProperty) => e.code === propertyName,
        );
      }

      if (property && property.type === "json") {
        params.push(JSON.stringify(entity[propertyName]));
        values += `$${params.length}::jsonb`;
      } else {
        params.push(entity[propertyName]);
        values += `$${params.length}`;
      }
    });

    command += ` (${propertyNames.map(this.quoteObject).join(", ")})`;
    command += ` VALUES (${values}) RETURNING *`;

    return {
      command,
      params: ctx.params,
    };
  }

  update(model: RpdDataModel, options: UpdateEntityOptions) {
    const params: any[] = [];
    const ctx: BuildQueryContext = {
      builder: this,
      params,
    };
    let { entity, filters } = options;
    let command = "UPDATE ";

    command += this.quoteTable(model);

    command += " SET ";
    const propertyNames: string[] = Object.keys(entity);
    propertyNames.forEach((propertyName, index) => {
      if (index) {
        command += ", ";
      }

      let property: RpdDataModelProperty | null = null;
      if (model) {
        property = _.find(
          model.properties,
          (e: RpdDataModelProperty) => (e.columnName || e.code) === propertyName,
        );
      }

      if (property && property.type === "json") {
        params.push(JSON.stringify(entity[propertyName]));
        command += `${this.quoteObject(propertyName)}=$${params.length}::jsonb`;
      } else {
        params.push(entity[propertyName]);
        command += `${this.quoteObject(propertyName)}=$${params.length}`;
      }
    });

    if (filters && filters.length) {
      command += " WHERE ";
      command += buildFiltersQuery(ctx, filters);
    }

    command += " RETURNING *";

    return {
      command,
      params: ctx.params,
    };
  }

  delete(model: RpdDataModel, options: DeleteEntityOptions) {
    const params: any[] = [];
    const ctx: BuildQueryContext = {
      builder: this,
      params,
    };
    let { filters } = options;
    let command = "DELETE FROM ";

    command += this.quoteTable(model);

    if (filters && filters.length) {
      command += " WHERE ";
      command += buildFiltersQuery(ctx, filters);
    }

    return {
      command,
      params: ctx.params,
    };
  }
}

export function buildFiltersQuery(
  ctx: BuildQueryContext,
  filters: EntityFilterOptions[],
) {
  return buildFilterQuery(0, ctx, {
    operator: "and",
    filters,
  });
}

function buildFilterQuery(
  level: number,
  ctx: BuildQueryContext,
  filter: EntityFilterOptions,
): string {
  const { operator } = filter;
  if (
    operator === "eq" || operator === "ne" || operator === "gt" ||
    operator === "gte" || operator === "lt" || operator === "lte"
  ) {
    return buildRelationalFilterQuery(ctx, filter);
  } else if (operator === "and" || operator === "or") {
    return buildLogicalFilterQuery(level, ctx, filter);
  } else if (operator === "null" || operator === "notNull") {
    return buildUnaryFilterQuery(ctx, filter);
  } else if (operator === "in" || operator === "notIn") {
    return buildInFilterQuery(ctx, filter);
  } else if (operator === "contains") {
    return buildContainsFilterQuery(ctx, filter);
  } else if (operator === "notContains") {
    return buildNotContainsFilterQuery(ctx, filter);
  } else if (operator === "startsWith") {
    return buildStartsWithFilterQuery(ctx, filter);
  } else if (operator === "notStartsWith") {
    return buildNotStartsWithFilterQuery(ctx, filter);
  } else if (operator === "endsWith") {
    return buildEndsWithFilterQuery(ctx, filter);
  } else if (operator === "notEndsWith") {
    return buildNotEndsWithFilterQuery(ctx, filter);
  } else {
    throw new Error(`Filter operator '${operator}' is not supported.`);
  }
}

function buildLogicalFilterQuery(
  level: number,
  ctx: BuildQueryContext,
  filter: FindEntityLogicalFilterOptions,
) {
  let dbOperator;
  if (filter.operator === "and") {
    dbOperator = " AND ";
  } else {
    dbOperator = " OR ";
  }

  let command = filter.filters.map(buildFilterQuery.bind(null, level + 1, ctx))
    .join(dbOperator);
  if (level) {
    return `(${command})`;
  }
  return command;
}

function buildUnaryFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityUnaryFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);
  if (filter.operator === "null") {
    command += " IS NULL";
  } else {
    command += " IS NOT NULL";
  }
  return command;
}

function buildInFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntitySetFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  if (filter.operator === "in") {
    command += " = ";
  } else {
    command += " <> ";
  }
  ctx.params.push(filter.value);
  command += `ANY($${ctx.params.length}::${filter.itemType || "int"}[])`;

  return command;
}

function buildContainsFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityRelationalFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  command += " LIKE ";
  ctx.params.push(`%${filter.value}%`);
  command += "$" + ctx.params.length;

  return command;
}

function buildNotContainsFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityRelationalFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  command += " NOT LIKE ";
  ctx.params.push(`%${filter.value}%`);
  command += "$" + ctx.params.length;

  return command;
}

function buildStartsWithFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityRelationalFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  command += " LIKE ";
  ctx.params.push(`${filter.value}%`);
  command += "$" + ctx.params.length;

  return command;
}

function buildNotStartsWithFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityRelationalFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  command += " NOT LIKE ";
  ctx.params.push(`${filter.value}%`);
  command += "$" + ctx.params.length;

  return command;
}

function buildEndsWithFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityRelationalFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  command += " LIKE ";
  ctx.params.push(`%${filter.value}`);
  command += "$" + ctx.params.length;

  return command;
}

function buildNotEndsWithFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityRelationalFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  command += " NOT LIKE ";
  ctx.params.push(`%${filter.value}`);
  command += "$" + ctx.params.length;

  return command;
}

function buildRelationalFilterQuery(
  ctx: BuildQueryContext,
  filter: FindEntityRelationalFilterOptions,
) {
  let command = ctx.builder.quoteObject(filter.field);

  command += relationalOperatorsMap.get(filter.operator);

  ctx.params.push(filter.value);
  command += "$" + ctx.params.length;

  return command;
}
