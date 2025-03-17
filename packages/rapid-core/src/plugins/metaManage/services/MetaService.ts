import { IRpdServer } from "~/core/server";
import { find, isString, map } from "lodash";
import { RouteContext } from "~/core/routeContext";
import { getEntityPropertyByCode, isOneRelationProperty, isRelationProperty } from "~/helpers/metaHelper";
import { IQueryBuilder, RpdApplicationConfig, RpdDataModel, RpdDataModelIndex, RpdDataPropertyTypes } from "~/types";
import { convertModelIndexConditionsToRowFilterOptions } from "~/helpers/filterHelper";
import { pgPropertyTypeColumnMap } from "~/dataAccess/columnTypeMapper";

type TableInformation = {
  table_schema: string;
  table_name: string;
  table_description: string;
};

type ColumnInformation = {
  table_schema: string;
  table_name: string;
  column_name: string;
  ordinal_position: number;
  description?: string;
  data_type: string;
  udt_name: string;
  is_nullable: "YES" | "NO";
  column_default: string;
  character_maximum_length: number;
  numeric_precision: number;
  numeric_scale: number;
};

type ConstraintInformation = {
  table_schema: string;
  table_name: string;
  constraint_type: string;
  constraint_name: string;
};

function generateCreateColumnDDL(
  queryBuilder: IQueryBuilder,
  options: {
    schema?: string;
    tableName: string;
    name: string;
    type: RpdDataPropertyTypes;
    autoIncrement?: boolean;
    notNull?: boolean;
    defaultValue?: string;
  },
) {
  let columnDDL = `ALTER TABLE ${queryBuilder.quoteTable(options)} ADD`;
  columnDDL += ` ${queryBuilder.quoteObject(options.name)}`;
  if (options.type === "integer" && options.autoIncrement) {
    columnDDL += ` serial`;
  } else {
    const columnType = pgPropertyTypeColumnMap[options.type];
    if (!columnType) {
      throw new Error(`Property type "${options.type}" is not supported.`);
    }
    columnDDL += ` ${columnType}`;
  }
  if (options.notNull) {
    columnDDL += " NOT NULL";
  }

  if (options.defaultValue) {
    columnDDL += ` DEFAULT ${options.defaultValue}`;
  }

  return columnDDL;
}

function generateLinkTableDDL(
  queryBuilder: IQueryBuilder,
  options: {
    linkSchema?: string;
    linkTableName: string;
    targetIdColumnName: string;
    selfIdColumnName: string;
  },
) {
  let columnDDL = `CREATE TABLE ${queryBuilder.quoteTable({
    schema: options.linkSchema,
    tableName: options.linkTableName,
  })} (`;
  columnDDL += `id serial not null,`;
  columnDDL += `${queryBuilder.quoteObject(options.selfIdColumnName)} integer not null,`;
  columnDDL += `${queryBuilder.quoteObject(options.targetIdColumnName)} integer not null);`;

  return columnDDL;
}

function generateTableIndexDDL(queryBuilder: IQueryBuilder, server: IRpdServer, model: RpdDataModel, index: RpdDataModelIndex) {
  let indexName = index.name;
  if (!indexName) {
    indexName = model.tableName;
    for (const indexProp of index.properties) {
      const propCode = isString(indexProp) ? indexProp : indexProp.code;
      const property = getEntityPropertyByCode(server, model, propCode);
      if (!isRelationProperty(property)) {
        indexName += "_" + property.columnName;
      } else if (isOneRelationProperty(property)) {
        indexName += "_" + property.targetIdColumnName;
      }
    }
    indexName += index.unique ? "_uindex" : "_index";
  }

  const indexColumns = map(index.properties, (indexProp) => {
    let columnName: string;
    const propCode = isString(indexProp) ? indexProp : indexProp.code;
    const property = getEntityPropertyByCode(server, model, propCode);
    if (!isRelationProperty(property)) {
      columnName = property.columnName;
    } else if (isOneRelationProperty(property)) {
      columnName = property.targetIdColumnName;
    }

    if (isString(indexProp)) {
      return columnName;
    }

    if (indexProp.order === "desc") {
      return `${columnName} desc`;
    }

    return columnName;
  });

  let ddl = `CREATE ${index.unique ? "UNIQUE" : ""} INDEX ${indexName} `;
  ddl += `ON ${queryBuilder.quoteTable({
    schema: model.schema,
    tableName: model.tableName,
  })} (${indexColumns.join(", ")})`;

  if (index.conditions) {
    const logger = server.getLogger();
    const rowFilterOptions = convertModelIndexConditionsToRowFilterOptions(logger, model, index.conditions);
    ddl += ` WHERE ${queryBuilder.buildFiltersExpression(model, rowFilterOptions)}`;
  }

  return ddl;
}

export default class MetaService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async syncDatabaseSchema(applicationConfig: RpdApplicationConfig) {
    const server = this.#server;
    const logger = server.getLogger();
    logger.info("Synchronizing database schema...");
    const sqlQueryTableInformations = `SELECT table_schema, table_name, obj_description((table_schema||'.'||quote_ident(table_name))::regclass) as table_description FROM information_schema.tables`;
    const tablesInDb: TableInformation[] = await server.queryDatabaseObject(sqlQueryTableInformations);
    const { queryBuilder } = server;

    for (const model of applicationConfig.models) {
      logger.debug(`Checking data table for '${model.namespace}.${model.singularCode}'...`);

      const expectedTableSchema = model.schema || server.databaseConfig.dbDefaultSchema;
      const expectedTableName = model.tableName;
      const tableInDb = find(tablesInDb, { table_schema: expectedTableSchema, table_name: expectedTableName });
      if (!tableInDb) {
        await server.queryDatabaseObject(`CREATE TABLE IF NOT EXISTS ${queryBuilder.quoteTable(model)} ()`, []);
      }
      if (!tableInDb || tableInDb.table_description != model.name) {
        await server.tryQueryDatabaseObject(`COMMENT ON TABLE ${queryBuilder.quoteTable(model)} IS ${queryBuilder.formatValueToSqlLiteral(model.name)};`, []);
      }
    }

    const sqlQueryColumnInformations = `SELECT c.table_schema, c.table_name, c.column_name, c.ordinal_position, d.description, c.data_type,  c.udt_name, c.is_nullable, c.column_default, c.character_maximum_length, c.numeric_precision, c.numeric_scale
      FROM information_schema.columns c
      INNER JOIN pg_catalog.pg_statio_all_tables st ON (st.schemaname = c.table_schema and st.relname = c.table_name)
      LEFT JOIN pg_catalog.pg_description d ON (d.objoid = st.relid and d.objsubid = c.ordinal_position);`;
    const columnsInDb: ColumnInformation[] = await server.queryDatabaseObject(sqlQueryColumnInformations, []);

    for (const model of applicationConfig.models) {
      logger.debug(`Checking data columns for '${model.namespace}.${model.singularCode}'...`);

      for (const property of model.properties) {
        let columnDDL = "";
        if (isRelationProperty(property)) {
          if (property.relation === "one") {
            const targetModel = applicationConfig.models.find((item) => item.singularCode === property.targetSingularCode);
            if (!targetModel) {
              logger.warn(`Cannot find target model with singular code "${property.targetSingularCode}".`);
            }

            const columnInDb: ColumnInformation | undefined = find(columnsInDb, {
              table_schema: model.schema || "public",
              table_name: model.tableName,
              column_name: property.targetIdColumnName!,
            });

            if (!columnInDb) {
              columnDDL = generateCreateColumnDDL(queryBuilder, {
                schema: model.schema,
                tableName: model.tableName,
                name: property.targetIdColumnName!,
                type: "integer",
                autoIncrement: false,
                notNull: property.required,
              });
              await server.tryQueryDatabaseObject(columnDDL);
            }

            if (!columnInDb || columnInDb.description != property.name) {
              await server.tryQueryDatabaseObject(
                `COMMENT ON COLUMN ${queryBuilder.quoteTable(model)}.${queryBuilder.quoteObject(
                  property.targetIdColumnName,
                )} IS ${queryBuilder.formatValueToSqlLiteral(property.name)};`,
                [],
              );
            }
          } else if (property.relation === "many") {
            if (property.linkTableName) {
              const tableInDb = find(tablesInDb, {
                table_schema: property.linkSchema || server.databaseConfig.dbDefaultSchema,
                table_name: property.linkTableName,
              });
              if (!tableInDb) {
                columnDDL = generateLinkTableDDL(queryBuilder, {
                  linkSchema: property.linkSchema,
                  linkTableName: property.linkTableName,
                  targetIdColumnName: property.targetIdColumnName!,
                  selfIdColumnName: property.selfIdColumnName!,
                });
              }

              const contraintName = `${property.linkTableName}_pk`;
              columnDDL += `ALTER TABLE ${queryBuilder.quoteTable({
                schema: property.linkSchema,
                tableName: property.linkTableName,
              })} ADD CONSTRAINT ${queryBuilder.quoteObject(contraintName)} PRIMARY KEY (id);`;
              await server.tryQueryDatabaseObject(columnDDL);
            } else {
              const targetModel = applicationConfig.models.find((item) => item.singularCode === property.targetSingularCode);
              if (!targetModel) {
                logger.warn(`Cannot find target model with singular code "${property.targetSingularCode}".`);
                continue;
              }

              const columnInDb: ColumnInformation | undefined = find(columnsInDb, {
                table_schema: targetModel.schema || "public",
                table_name: targetModel.tableName,
                column_name: property.selfIdColumnName!,
              });

              if (!columnInDb) {
                columnDDL = generateCreateColumnDDL(queryBuilder, {
                  schema: targetModel.schema,
                  tableName: targetModel.tableName,
                  name: property.selfIdColumnName || "",
                  type: "integer",
                  autoIncrement: false,
                  notNull: property.required,
                });
                await server.tryQueryDatabaseObject(columnDDL);
              }
            }
          } else {
            continue;
          }
        } else {
          const columnName = property.columnName || property.code;
          const columnInDb: ColumnInformation | undefined = find(columnsInDb, {
            table_schema: model.schema || "public",
            table_name: model.tableName,
            column_name: columnName,
          });

          if (!columnInDb) {
            // create column if not exists
            columnDDL = generateCreateColumnDDL(queryBuilder, {
              schema: model.schema,
              tableName: model.tableName,
              name: columnName,
              type: property.type,
              autoIncrement: property.autoIncrement,
              notNull: property.required,
              defaultValue: property.defaultValue,
            });
            await server.tryQueryDatabaseObject(columnDDL);
          } else {
            const expectedColumnType = pgPropertyTypeColumnMap[property.type];
            if (columnInDb.udt_name !== expectedColumnType) {
              const sqlAlterColumnType = `alter table ${queryBuilder.quoteTable(model)} alter column ${queryBuilder.quoteObject(
                columnName,
              )} type ${expectedColumnType}`;
              await server.tryQueryDatabaseObject(sqlAlterColumnType);
            }

            if (property.defaultValue) {
              if (!columnInDb.column_default) {
                const sqlSetColumnDefault = `alter table ${queryBuilder.quoteTable(model)} alter column ${queryBuilder.quoteObject(columnName)} set default ${
                  property.defaultValue
                }`;
                await server.tryQueryDatabaseObject(sqlSetColumnDefault);
              }
            } else {
              if (columnInDb.column_default && !property.autoIncrement) {
                const sqlDropColumnDefault = `alter table ${queryBuilder.quoteTable(model)} alter column ${queryBuilder.quoteObject(columnName)} drop default`;
                await server.tryQueryDatabaseObject(sqlDropColumnDefault);
              }
            }

            if (property.required) {
              if (columnInDb.is_nullable === "YES") {
                const sqlSetColumnNotNull = `alter table ${queryBuilder.quoteTable(model)} alter column ${queryBuilder.quoteObject(columnName)} set not null`;
                await server.tryQueryDatabaseObject(sqlSetColumnNotNull);
              }
            } else {
              if (columnInDb.is_nullable === "NO") {
                const sqlDropColumnNotNull = `alter table ${queryBuilder.quoteTable(model)} alter column ${queryBuilder.quoteObject(columnName)} drop not null`;
                await server.tryQueryDatabaseObject(sqlDropColumnNotNull);
              }
            }
          }

          if (!columnInDb || columnInDb.description != property.name) {
            await server.tryQueryDatabaseObject(
              `COMMENT ON COLUMN ${queryBuilder.quoteTable(model)}.${queryBuilder.quoteObject(
                property.columnName || property.code,
              )} IS ${queryBuilder.formatValueToSqlLiteral(property.name)};`,
              [],
            );
          }
        }
      }
    }

    const sqlQueryConstraints = `SELECT table_schema, table_name, constraint_type, constraint_name FROM information_schema.table_constraints WHERE constraint_type = 'PRIMARY KEY';`;
    const constraintsInDb: ConstraintInformation[] = await server.queryDatabaseObject(sqlQueryConstraints);
    for (const model of applicationConfig.models) {
      const expectedTableSchema = model.schema || server.databaseConfig.dbDefaultSchema;
      const expectedTableName = model.tableName;
      const expectedContraintName = `${expectedTableName}_pk`;
      logger.debug(`Checking pk for '${expectedTableSchema}.${expectedTableName}'...`);
      const constraintInDb = find(constraintsInDb, {
        table_schema: expectedTableSchema,
        table_name: expectedTableName,
        constraint_type: "PRIMARY KEY",
        constraint_name: expectedContraintName,
      });
      if (!constraintInDb) {
        await server.queryDatabaseObject(
          `ALTER TABLE ${queryBuilder.quoteTable(model)} ADD CONSTRAINT ${queryBuilder.quoteObject(expectedContraintName)} PRIMARY KEY (id);`,
          [],
        );
      }
    }

    // generate indexes
    for (const model of applicationConfig.models) {
      if (!model.indexes || !model.indexes.length) {
        continue;
      }

      logger.debug(`Creating indexes of table ${queryBuilder.quoteTable(model)}`);
      for (const index of model.indexes) {
        const sqlCreateIndex = generateTableIndexDDL(queryBuilder, server, model, index);
        await server.tryQueryDatabaseObject(sqlCreateIndex, []);
      }
    }
  }
}
