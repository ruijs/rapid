import {
  AddEntityRelationsOptions,
  CountEntityOptions,
  CountEntityResult,
  CreateEntityOptions,
  DeleteEntityByIdOptions,
  EntityFilterOperators,
  EntityFilterOptions,
  EntityNonRelationPropertyFilterOptions,
  FindEntityByIdOptions,
  FindEntityOptions,
  FindEntityOrderByOptions,
  IRpdDataAccessor,
  RemoveEntityRelationsOptions,
  RpdDataModel,
  RpdDataModelIndex,
  RpdDataModelIndexOptions,
  RpdDataModelProperty,
  UpdateEntityByIdOptions,
  FindEntityFindOneRelationEntitiesOptions,
  FindEntityFindManyRelationEntitiesOptions,
} from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { mapDbRowToEntity, mapEntityToDbRow } from "./entityMapper";
import { mapPropertyNameToColumnName } from "./propertyMapper";
import { IRpdServer, RapidPlugin } from "~/core/server";
import { getEntityPartChanges } from "~/helpers/entityHelpers";
import { cloneDeep, filter, find, first, forEach, isArray, isNumber, isObject, isPlainObject, isString, isUndefined, keys, map, reject, uniq } from "lodash";
import {
  getEntityPropertiesIncludingBase,
  getEntityProperty,
  getEntityPropertyByCode,
  getEntityPropertyByFieldName,
  isManyRelationProperty,
  isOneRelationProperty,
  isRelationProperty,
} from "../helpers/metaHelper";
import { ColumnSelectOptions, CountRowOptions, FindRowOptions, FindRowOrderByOptions, RowFilterOptions } from "./dataAccessTypes";
import { newEntityOperationError } from "~/utilities/errorUtility";
import { getNowStringWithTimezone } from "~/utilities/timeUtility";
import { RouteContext } from "~/core/routeContext";

export type FindOneRelationEntitiesOptions = {
  server: IRpdServer;
  mainModel: RpdDataModel;
  relationProperty: RpdDataModelProperty;
  relationEntityIds: any[];
  selectRelationOptions?: FindEntityFindOneRelationEntitiesOptions;
};

export type FindManyRelationEntitiesOptions = {
  server: IRpdServer;
  mainModel: RpdDataModel;
  relationProperty: RpdDataModelProperty;
  mainEntityIds: any[];
  selectRelationOptions?: FindEntityFindManyRelationEntitiesOptions;
};

function convertEntityOrderByToRowOrderBy(server: IRpdServer, model: RpdDataModel, baseModel?: RpdDataModel, orderByList?: FindEntityOrderByOptions[]) {
  if (!orderByList) {
    return null;
  }

  return orderByList.map((orderBy) => {
    const fields = orderBy.field.split(".");
    let orderField: string;
    let relationField: string;
    if (fields.length === 1) {
      orderField = fields[0];
    } else {
      orderField = fields[1];
      relationField = fields[0];
    }
    if (relationField) {
      const relationProperty = getEntityPropertyByCode(server, model, relationField);
      if (!relationProperty) {
        throw new Error(`Property '${relationProperty}' was not found in ${model.namespace}.${model.singularCode}`);
      }
      if (!isRelationProperty(relationProperty)) {
        throw new Error("orderBy[].relation must be a one-relation property.");
      }

      if (isManyRelationProperty(relationProperty)) {
        throw new Error("orderBy[].relation must be a one-relation property.");
      }

      const relationModel = server.getModel({ singularCode: relationProperty.targetSingularCode });
      let relationBaseModel: RpdDataModel = null;
      if (relationModel.base) {
        relationBaseModel = server.getModel({ singularCode: relationModel.base });
      }
      let property = getEntityPropertyByFieldName(server, relationModel, orderField);
      if (!property) {
        throw new Error(`Unkown orderBy field '${orderField}' of relation '${relationField}'`);
      }

      return {
        field: {
          name: mapPropertyNameToColumnName(server, relationModel, orderField),
          tableName: property.isBaseProperty ? relationBaseModel.tableName : relationModel.tableName,
          schema: property.isBaseProperty ? relationBaseModel.schema : relationModel.schema,
        },
        relationField: {
          name: mapPropertyNameToColumnName(server, model, relationField),
          tableName: relationProperty.isBaseProperty ? baseModel.tableName : model.tableName,
          schema: relationProperty.isBaseProperty ? baseModel.schema : model.schema,
        },
        desc: !!orderBy.desc,
      } as FindRowOrderByOptions;
    } else {
      let property = getEntityPropertyByFieldName(server, model, orderField);
      if (!property) {
        throw new Error(`Unkown orderBy field '${orderField}'`);
      }

      return {
        field: {
          name: mapPropertyNameToColumnName(server, model, orderField),
          tableName: property.isBaseProperty ? baseModel.tableName : model.tableName,
        },
        desc: !!orderBy.desc,
      } as FindRowOrderByOptions;
    }
  });
}

async function findEntities(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: FindEntityOptions) {
  const model = dataAccessor.getModel();
  let baseModel: RpdDataModel | undefined;
  if (model.base) {
    baseModel = server.getModel({
      singularCode: model.base,
    });
  }

  let propertiesToSelect: RpdDataModelProperty[];
  let relationOptions = options.relations || {};
  let relationPropertyCodes = Object.keys(relationOptions) || [];
  if (!options.properties || !options.properties.length) {
    propertiesToSelect = getEntityPropertiesIncludingBase(server, model).filter((property) => {
      return !isRelationProperty(property) || relationPropertyCodes.includes(property.code);
    });
  } else {
    propertiesToSelect = getEntityPropertiesIncludingBase(server, model).filter(
      (property) => options.properties.includes(property.code) || relationPropertyCodes.includes(property.code),
    );
  }

  const columnsToSelect: ColumnSelectOptions[] = [];

  const relationPropertiesToSelect: RpdDataModelProperty[] = [];
  forEach(propertiesToSelect, (property) => {
    if (isRelationProperty(property)) {
      relationPropertiesToSelect.push(property);

      if (property.relation === "one" && !property.linkTableName) {
        if (!property.targetIdColumnName) {
          throw new Error(`'targetIdColumnName' should be configured for property '${property.code}' of model '${model.namespace}.${model.singularCode}'.`);
        }

        if (property.isBaseProperty) {
          columnsToSelect.push({
            name: property.targetIdColumnName,
            tableName: baseModel.tableName,
          });
        } else {
          columnsToSelect.push({
            name: property.targetIdColumnName,
            tableName: model.tableName,
          });
        }
      }
    } else {
      if (property.isBaseProperty) {
        columnsToSelect.push({
          name: property.columnName || property.code,
          tableName: baseModel.tableName,
        });
      } else {
        columnsToSelect.push({
          name: property.columnName || property.code,
          tableName: model.tableName,
        });
      }
    }
  });

  // if `keepNonPropertyFields` is true and `properties` are not specified, then select relation columns automatically.
  if (options.keepNonPropertyFields && (!options.properties || !options.properties.length)) {
    const oneRelationPropertiesWithNoLinkTable = getEntityPropertiesIncludingBase(server, model).filter(
      (property) => property.relation === "one" && !property.linkTableName,
    );
    oneRelationPropertiesWithNoLinkTable.forEach((property) => {
      if (property.targetIdColumnName) {
        columnsToSelect.push({
          name: property.targetIdColumnName,
          tableName: property.isBaseProperty ? baseModel.tableName : model.tableName,
        });
      }
    });
  }

  if (options.extraColumnsToSelect) {
    forEach(options.extraColumnsToSelect, (extraColumnToSelect: ColumnSelectOptions) => {
      const columnSelectOptionExists = find(columnsToSelect, (item: ColumnSelectOptions) => {
        if (typeof item === "string") {
          if (typeof extraColumnToSelect === "string") {
            return item === extraColumnToSelect;
          } else {
            return item == extraColumnToSelect.name;
          }
        } else {
          if (typeof extraColumnToSelect === "string") {
            return item.name === extraColumnToSelect;
          } else {
            return item.name == extraColumnToSelect.name;
          }
        }
      });

      if (!columnSelectOptionExists) {
        columnsToSelect.push(extraColumnToSelect);
      }
    });
  }

  const rowFilters = await convertEntityFiltersToRowFilters(server, model, baseModel, options.filters);
  const findRowOptions: FindRowOptions = {
    filters: rowFilters,
    orderBy: convertEntityOrderByToRowOrderBy(server, model, baseModel, options.orderBy),
    pagination: options.pagination,
    fields: columnsToSelect,
  };
  const rows = await dataAccessor.find(findRowOptions);
  if (!rows.length) {
    return [];
  }

  const entityIds = rows.map((row) => row.id);
  if (relationPropertiesToSelect.length) {
    for (const relationProperty of relationPropertiesToSelect) {
      const isManyRelation = relationProperty.relation === "many";

      if (relationProperty.linkTableName) {
        const relationModel = server.getModel({ singularCode: relationProperty.targetSingularCode! });
        if (!relationModel) {
          continue;
        }

        if (isManyRelation) {
          const relationLinks = await findManyRelationLinksViaLinkTable({
            server,
            mainModel: relationModel,
            relationProperty,
            mainEntityIds: entityIds,
            selectRelationOptions: relationOptions[relationProperty.code],
          });

          forEach(rows, (row: any) => {
            row[relationProperty.code] = filter(relationLinks, (link: any) => {
              return link[relationProperty.selfIdColumnName!] == row["id"];
            }).map((link) => mapDbRowToEntity(server, relationModel, link.targetEntity, options.keepNonPropertyFields));
          });
        }
      } else {
        let relatedEntities: any[];
        if (isManyRelation) {
          relatedEntities = await findManyRelatedEntitiesViaIdPropertyCode({
            server,
            mainModel: model,
            relationProperty,
            mainEntityIds: entityIds,
            selectRelationOptions: relationOptions[relationProperty.code],
          });
        } else {
          const targetEntityIds = uniq(
            reject(
              map(rows, (entity: any) => entity[relationProperty.targetIdColumnName!]),
              isNullOrUndefined,
            ),
          );
          relatedEntities = await findOneRelatedEntitiesViaIdPropertyCode({
            server,
            mainModel: model,
            relationProperty,
            relationEntityIds: targetEntityIds,
            selectRelationOptions: relationOptions[relationProperty.code],
          });
        }

        const targetModel = server.getModel({
          singularCode: relationProperty.targetSingularCode!,
        });
        rows.forEach((row) => {
          if (isManyRelation) {
            row[relationProperty.code] = filter(relatedEntities, (relatedEntity: any) => {
              return relatedEntity[relationProperty.selfIdColumnName!] == row.id;
            }).map((item) => mapDbRowToEntity(server, targetModel!, item, options.keepNonPropertyFields));
          } else {
            row[relationProperty.code] = mapDbRowToEntity(
              server,
              targetModel!,
              find(relatedEntities, (relatedEntity: any) => {
                // TODO: id property code should be configurable.
                return relatedEntity["id"] == row[relationProperty.targetIdColumnName!];
              }),
              options.keepNonPropertyFields,
            );
          }
        });
      }
    }
  }
  const entities = rows.map((item) => mapDbRowToEntity(server, model, item, options.keepNonPropertyFields));

  await server.emitEvent({
    eventName: "entity.beforeResponse",
    payload: {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      baseModelSingularCode: model.base,
      entities,
    },
    sender: null,
    routeContext: options.routeContext,
  });

  return entities;
}

async function findEntity(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: FindEntityOptions) {
  const entities = await findEntities(server, dataAccessor, options);
  return first(entities);
}

async function findById(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: FindEntityByIdOptions): Promise<any> {
  const { id, properties, keepNonPropertyFields, routeContext } = options;
  return await findEntity(server, dataAccessor, {
    filters: [
      {
        operator: "eq",
        field: "id",
        value: id,
      },
    ],
    properties,
    keepNonPropertyFields,
    routeContext,
  });
}

async function convertEntityFiltersToRowFilters(
  server: IRpdServer,
  model: RpdDataModel,
  baseModel: RpdDataModel,
  filters: EntityFilterOptions[] | undefined,
): Promise<RowFilterOptions[]> {
  if (!filters || !filters.length) {
    return [];
  }

  const replacedFilters: RowFilterOptions[] = [];
  for (const filter of filters) {
    const { operator } = filter;
    if (operator === "and" || operator === "or") {
      replacedFilters.push({
        operator: operator,
        filters: await convertEntityFiltersToRowFilters(server, model, baseModel, filter.filters),
      });
    } else if (operator === "exists" || operator === "notExists") {
      const relationProperty: RpdDataModelProperty = getEntityPropertyByCode(server, model, filter.field);
      if (!relationProperty) {
        throw new Error(`Invalid filters. Property '${filter.field}' was not found in model '${model.namespace}.${model.singularCode}'`);
      }
      if (!isRelationProperty(relationProperty)) {
        throw new Error(
          `Invalid filters. Filter with 'existence' operator on property '${filter.field}' is not allowed. You can only use it on an relation property.`,
        );
      }

      const relatedEntityFilters = filter.filters;
      if (!relatedEntityFilters || !relatedEntityFilters.length) {
        throw new Error(`Invalid filters. 'filters' must be provided on filter with 'existence' operator.`);
      }

      if (relationProperty.relation === "one") {
        // Optimize when filtering by id of related entity
        if (relatedEntityFilters.length === 1) {
          const relatedEntityIdFilter = relatedEntityFilters[0];
          if ((relatedEntityIdFilter.operator === "eq" || relatedEntityIdFilter.operator === "in") && relatedEntityIdFilter.field === "id") {
            let replacedOperator: EntityFilterOperators;
            if (operator === "exists") {
              replacedOperator = relatedEntityIdFilter.operator;
            } else {
              if (relatedEntityIdFilter.operator === "eq") {
                replacedOperator = "ne";
              } else {
                replacedOperator = "notIn";
              }
            }
            replacedFilters.push({
              field: {
                name: relationProperty.targetIdColumnName!,
                tableName: relationProperty.isBaseProperty ? baseModel.tableName : model.tableName,
              },
              operator: replacedOperator,
              value: relatedEntityIdFilter.value,
            });
            continue;
          }
        }

        const dataAccessor = server.getDataAccessor({
          singularCode: relationProperty.targetSingularCode as string,
        });
        const relatedModel = dataAccessor.getModel();
        let relatedBaseModel: RpdDataModel;
        if (relatedModel.base) {
          relatedBaseModel = server.getModel({
            singularCode: relatedModel.base,
          });
        }
        const rows = await dataAccessor.find({
          filters: await convertEntityFiltersToRowFilters(server, relatedModel, relatedBaseModel, filter.filters),
          fields: [
            {
              name: "id",
              tableName: relatedModel.tableName,
            },
          ],
        });
        const entityIds = map(rows, (entity: any) => entity["id"]);
        replacedFilters.push({
          field: {
            name: relationProperty.targetIdColumnName,
            tableName: relationProperty.isBaseProperty ? baseModel.tableName : model.tableName,
          },
          operator: operator === "exists" ? "in" : "notIn",
          value: entityIds,
        });
      } else if (!relationProperty.linkTableName) {
        // many relation without link table.
        if (!relationProperty.selfIdColumnName) {
          throw new Error(`Invalid filters. 'selfIdColumnName' of property '${relationProperty.code}' was not configured`);
        }

        const targetEntityDataAccessor = server.getDataAccessor({
          singularCode: relationProperty.targetSingularCode as string,
        });
        const relatedModel = targetEntityDataAccessor.getModel();
        let relatedBaseModel: RpdDataModel;
        if (relatedModel.base) {
          relatedBaseModel = server.getModel({
            singularCode: relatedModel.base,
          });
        }
        const targetEntities = await targetEntityDataAccessor.find({
          filters: await convertEntityFiltersToRowFilters(server, relatedModel, relatedBaseModel, filter.filters),
          fields: [
            {
              name: relationProperty.selfIdColumnName,
              tableName: relatedModel.tableName,
            },
          ],
        });
        const selfEntityIds = map(targetEntities, (entity: any) => entity[relationProperty.selfIdColumnName!]);
        replacedFilters.push({
          field: {
            name: "id",
            tableName: model.tableName,
          },
          operator: operator === "exists" ? "in" : "notIn",
          value: selfEntityIds,
        });
      } else {
        // many relation with link table
        if (!relationProperty.selfIdColumnName) {
          throw new Error(`Invalid filters. 'selfIdColumnName' of property '${relationProperty.code}' was not configured`);
        }

        if (!relationProperty.targetIdColumnName) {
          throw new Error(`Invalid filters. 'targetIdColumnName' of property '${relationProperty.code}' was not configured`);
        }

        // 1. find target entities
        // 2. find links
        // 3. convert to 'in' filter
        const targetEntityDataAccessor = server.getDataAccessor({
          singularCode: relationProperty.targetSingularCode as string,
        });
        const relatedModel = targetEntityDataAccessor.getModel();
        let relatedBaseModel: RpdDataModel;
        if (relatedModel.base) {
          relatedBaseModel = server.getModel({
            singularCode: relatedModel.base,
          });
        }
        const targetEntities = await targetEntityDataAccessor.find({
          filters: await convertEntityFiltersToRowFilters(server, relatedModel, relatedBaseModel, filter.filters),
          fields: [
            {
              name: "id",
              tableName: relatedModel.tableName,
            },
          ],
        });
        const targetEntityIds = map(targetEntities, (entity: any) => entity["id"]);

        const command = `SELECT * FROM ${server.queryBuilder.quoteTable({
          schema: relationProperty.linkSchema,
          tableName: relationProperty.linkTableName!,
        })} WHERE ${server.queryBuilder.quoteObject(relationProperty.targetIdColumnName!)} = ANY($1::int[])`;
        const params = [targetEntityIds];
        const links = await server.queryDatabaseObject(command, params);
        const selfEntityIds = links.map((link) => link[relationProperty.selfIdColumnName!]);
        replacedFilters.push({
          field: {
            name: "id",
            tableName: model.tableName,
          },
          operator: operator === "exists" ? "in" : "notIn",
          value: selfEntityIds,
        });
      }
    } else {
      const filterField = (filter as EntityNonRelationPropertyFilterOptions).field;
      let property: RpdDataModelProperty = getEntityPropertyByCode(server, model, filterField);

      let filterValue = (filter as any).value;

      let columnName = "";
      if (property) {
        if (isOneRelationProperty(property)) {
          columnName = property.targetIdColumnName;
          if (isPlainObject(filterValue)) {
            filterValue = filterValue.id;
          }
        } else if (isManyRelationProperty(property)) {
          throw new Error(`Operator "${operator}" is not supported on many-relation property "${property.code}"`);
        } else {
          columnName = property.columnName || property.code;
        }
      } else {
        property = getEntityProperty(server, model, (property) => {
          return property.columnName === filterField;
        });

        if (property) {
          columnName = property.columnName;
        } else {
          property = getEntityProperty(server, model, (property) => {
            return property.targetIdColumnName === filterField;
          });

          if (property) {
            columnName = property.targetIdColumnName;
            if (isPlainObject(filterValue)) {
              filterValue = filterValue.id;
            }
          } else {
            columnName = filterField;
          }
        }
      }

      // TODO: do not use `any` here
      replacedFilters.push({
        operator: filter.operator,
        field: {
          name: columnName,
          tableName: property && property.isBaseProperty ? baseModel.tableName : model.tableName,
        },
        value: filterValue,
        itemType: (filter as any).itemType,
      } as any);
    }
  }
  return replacedFilters;
}

async function findManyRelationLinksViaLinkTable(options: FindManyRelationEntitiesOptions) {
  const { server, relationProperty, mainModel: relationModel, mainEntityIds, selectRelationOptions } = options;
  const command = `SELECT * FROM ${server.queryBuilder.quoteTable({
    schema: relationProperty.linkSchema,
    tableName: relationProperty.linkTableName!,
  })} WHERE ${server.queryBuilder.quoteObject(relationProperty.selfIdColumnName!)} = ANY($1::int[])
    ORDER BY id
  `;
  const params = [mainEntityIds];
  const links = await server.queryDatabaseObject(command, params);
  const targetEntityIds = links.map((link) => link[relationProperty.targetIdColumnName!]);

  const dataAccessor = server.getDataAccessor({
    namespace: relationModel.namespace,
    singularCode: relationModel.singularCode,
  });

  const findEntityOptions: FindEntityOptions = {
    filters: [
      {
        field: "id",
        operator: "in",
        value: targetEntityIds,
      },
    ],
    keepNonPropertyFields: true,
  };

  if (selectRelationOptions) {
    if (typeof selectRelationOptions !== "boolean") {
      if (selectRelationOptions.properties) {
        findEntityOptions.properties = ["id", ...selectRelationOptions.properties];
      }
      if (selectRelationOptions.relations) {
        findEntityOptions.relations = selectRelationOptions.relations;
      }
      if (selectRelationOptions.orderBy) {
        findEntityOptions.orderBy = selectRelationOptions.orderBy;
      }
      if (selectRelationOptions.pagination) {
        findEntityOptions.pagination = selectRelationOptions.pagination;
      }
      if (selectRelationOptions.filters) {
        findEntityOptions.filters = [...findEntityOptions.filters, ...selectRelationOptions.filters];
      }
      if (!isUndefined(selectRelationOptions.keepNonPropertyFields)) {
        findEntityOptions.keepNonPropertyFields = selectRelationOptions.keepNonPropertyFields;
      }
    }
  }

  const targetEntities = await findEntities(server, dataAccessor, findEntityOptions);

  forEach(links, (link: any) => {
    link.targetEntity = find(targetEntities, (e: any) => e["id"] == link[relationProperty.targetIdColumnName!]);
  });

  return links;
}

async function findManyRelatedEntitiesViaIdPropertyCode(options: FindManyRelationEntitiesOptions) {
  const { server, relationProperty, mainEntityIds, selectRelationOptions } = options;
  const dataAccessor = server.getDataAccessor({
    singularCode: relationProperty.targetSingularCode as string,
  });

  const findEntityOptions: FindEntityOptions = {
    filters: [
      {
        field: relationProperty.selfIdColumnName,
        operator: "in",
        value: mainEntityIds,
      },
    ],
    orderBy: [
      {
        field: "id",
      },
    ],
    extraColumnsToSelect: [relationProperty.selfIdColumnName],
    keepNonPropertyFields: true,
  };

  if (selectRelationOptions) {
    if (typeof selectRelationOptions !== "boolean") {
      if (selectRelationOptions.properties) {
        findEntityOptions.properties = ["id", ...selectRelationOptions.properties];
      }
      if (selectRelationOptions.relations) {
        findEntityOptions.relations = selectRelationOptions.relations;
      }
      if (selectRelationOptions.orderBy) {
        findEntityOptions.orderBy = selectRelationOptions.orderBy;
      }
      if (selectRelationOptions.pagination) {
        findEntityOptions.pagination = selectRelationOptions.pagination;
      }
      if (selectRelationOptions.filters) {
        findEntityOptions.filters = [...findEntityOptions.filters, ...selectRelationOptions.filters];
      }
      if (!isUndefined(selectRelationOptions.keepNonPropertyFields)) {
        findEntityOptions.keepNonPropertyFields = selectRelationOptions.keepNonPropertyFields;
      }
    }
  }

  return await findEntities(server, dataAccessor, findEntityOptions);
}

async function findOneRelatedEntitiesViaIdPropertyCode(options: FindOneRelationEntitiesOptions) {
  const { server, relationProperty, relationEntityIds, selectRelationOptions } = options;

  const dataAccessor = server.getDataAccessor({
    singularCode: relationProperty.targetSingularCode as string,
  });

  const findEntityOptions: FindEntityOptions = {
    filters: [
      {
        field: "id",
        operator: "in",
        value: relationEntityIds,
      },
    ],
    keepNonPropertyFields: true,
  };

  if (selectRelationOptions) {
    if (typeof selectRelationOptions !== "boolean") {
      if (selectRelationOptions.properties) {
        findEntityOptions.properties = ["id", ...selectRelationOptions.properties];
      }
      if (selectRelationOptions.relations) {
        findEntityOptions.relations = selectRelationOptions.relations;
      }
    }
  }

  return await findEntities(server, dataAccessor, findEntityOptions);
}

async function createEntity(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: CreateEntityOptions, plugin?: RapidPlugin) {
  const model = dataAccessor.getModel();
  if (model.derivedTypePropertyCode) {
    throw newEntityOperationError("Create base entity directly is not allowed.");
  }

  const { entity, routeContext } = options;

  const userId = options.routeContext?.state?.userId;
  if (userId) {
    const createdByProperty = getEntityPropertyByCode(server, model, "createdBy");
    if (createdByProperty) {
      entity.createdBy = userId;
    }
  }
  const createdAtProperty = getEntityPropertyByCode(server, model, "createdAt");
  if (createdAtProperty) {
    entity.createdAt = getNowStringWithTimezone();
  }

  await server.beforeCreateEntity(model, options);

  await server.emitEvent({
    eventName: "entity.beforeCreate",
    payload: {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      baseModelSingularCode: model.base,
      before: entity,
    },
    sender: plugin,
    routeContext,
  });

  // check unique constraints
  if (!options.postponeUniquenessCheck) {
    if (model.indexes && model.indexes.length) {
      for (const indexConfig of model.indexes) {
        if (!indexConfig.unique) {
          continue;
        }

        const duplicate = await willEntityDuplicate(server, dataAccessor, {
          routeContext: options.routeContext,
          entityToSave: entity,
          indexConfig,
        });
        if (duplicate) {
          throw new Error(getEntityDuplicatedErrorMessage(server, model, indexConfig));
        }
      }
    }
  }

  const oneRelationPropertiesToCreate: RpdDataModelProperty[] = [];
  const manyRelationPropertiesToCreate: RpdDataModelProperty[] = [];
  keys(entity).forEach((propertyCode) => {
    const property = getEntityPropertyByCode(server, model, propertyCode);
    if (!property) {
      // Unknown property
      return;
    }

    if (isRelationProperty(property)) {
      if (property.relation === "many") {
        manyRelationPropertiesToCreate.push(property);
      } else {
        oneRelationPropertiesToCreate.push(property);
      }
    }
  });

  const { row, baseRow } = mapEntityToDbRow(server, model, entity);

  const newEntityOneRelationProps = {};
  // save one-relation properties
  for (const property of oneRelationPropertiesToCreate) {
    const rowToBeSaved = property.isBaseProperty ? baseRow : row;
    const fieldValue = entity[property.code];
    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });
    if (isObject(fieldValue)) {
      const targetEntityId = fieldValue["id"];
      if (!targetEntityId) {
        if (!property.selfIdColumnName) {
          const targetEntity = fieldValue;
          const newTargetEntity = await createEntity(server, targetDataAccessor, {
            routeContext,
            entity: targetEntity,
          });
          newEntityOneRelationProps[property.code] = newTargetEntity;
          rowToBeSaved[property.targetIdColumnName!] = newTargetEntity["id"];
        }
      } else {
        const targetEntity = await findById(server, targetDataAccessor, {
          id: targetEntityId,
          routeContext,
        });
        if (!targetEntity) {
          throw newEntityOperationError(
            `Create ${model.singularCode} entity failed. Property '${property.code}' was invalid. Related ${property.targetSingularCode} entity with id '${targetEntityId}' was not found.`,
          );
        }
        newEntityOneRelationProps[property.code] = targetEntity;
        rowToBeSaved[property.targetIdColumnName!] = targetEntityId;
      }
    } else if (isNumber(fieldValue) || isString(fieldValue)) {
      // fieldValue is id;
      const targetEntityId = fieldValue;
      const targetEntity = await findById(server, targetDataAccessor, {
        id: targetEntityId,
        routeContext,
      });
      if (!targetEntity) {
        throw newEntityOperationError(
          `Create ${model.singularCode} entity failed. Property '${property.code}' was invalid. Related ${property.targetSingularCode} entity with id '${targetEntityId}' was not found.`,
        );
      }
      newEntityOneRelationProps[property.code] = targetEntity;
      rowToBeSaved[property.targetIdColumnName!] = targetEntityId;
    } else {
      newEntityOneRelationProps[property.code] = null;
      rowToBeSaved[property.targetIdColumnName!] = null;
    }
  }

  let newBaseRow: any;
  let baseDataAccessor: any;
  if (model.base) {
    baseDataAccessor = server.getDataAccessor({
      singularCode: model.base,
    });
    newBaseRow = await baseDataAccessor.create(baseRow);

    row.id = newBaseRow.id;
  }
  const newRow = await dataAccessor.create(row);
  const newEntity = mapDbRowToEntity(server, model, Object.assign({}, newBaseRow, newRow, newEntityOneRelationProps), true);

  // save one-relation properties that has selfIdColumnName
  for (const property of oneRelationPropertiesToCreate) {
    const fieldValue = entity[property.code];
    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });
    if (isObject(fieldValue)) {
      const targetEntityId = fieldValue["id"];
      if (!targetEntityId) {
        if (property.selfIdColumnName) {
          const targetEntity = fieldValue;
          targetEntity[property.selfIdColumnName] = newEntity.id;
          const newTargetEntity = await createEntity(server, targetDataAccessor, {
            routeContext,
            entity: targetEntity,
          });

          let dataAccessorOfMainEntity = dataAccessor;
          if (property.isBaseProperty) {
            dataAccessorOfMainEntity = baseDataAccessor;
          }

          const relationFieldChanges = {
            [property.targetIdColumnName]: newTargetEntity.id,
          };
          await dataAccessorOfMainEntity.updateById(newEntity.id, relationFieldChanges);
          newEntity[property.code] = newTargetEntity;
        }
      }
    }
  }

  // save many-relation properties
  for (const property of manyRelationPropertiesToCreate) {
    newEntity[property.code] = [];

    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });

    const relatedEntitiesToBeSaved = entity[property.code];
    if (!isArray(relatedEntitiesToBeSaved)) {
      throw new Error(`Value of field '${property.code}' should be an array.`);
    }

    for (const relatedEntityToBeSaved of relatedEntitiesToBeSaved) {
      let relatedEntityId: any;
      if (isObject(relatedEntityToBeSaved)) {
        relatedEntityId = relatedEntityToBeSaved["id"];
        if (!relatedEntityId) {
          // related entity is to be created
          const targetEntity = relatedEntityToBeSaved;
          if (!property.linkTableName) {
            targetEntity[property.selfIdColumnName!] = newEntity.id;
          }
          const newTargetEntity = await createEntity(server, targetDataAccessor, {
            routeContext,
            entity: targetEntity,
          });

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({
              schema: property.linkSchema,
              tableName: property.linkTableName,
            })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
            const params = [newEntity.id, newTargetEntity.id];
            await server.queryDatabaseObject(command, params);
          }

          newEntity[property.code].push(newTargetEntity);
        } else {
          // related entity is existed
          const targetEntity = await targetDataAccessor.findById(relatedEntityId);
          if (!targetEntity) {
            throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`);
          }

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({
              schema: property.linkSchema,
              tableName: property.linkTableName,
            })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
            const params = [newEntity.id, relatedEntityId];
            await server.queryDatabaseObject(command, params);
          } else {
            await targetDataAccessor.updateById(targetEntity.id, { [property.selfIdColumnName!]: newEntity.id });
            targetEntity[property.selfIdColumnName!] = newEntity.id;
          }
          newEntity[property.code].push(targetEntity);
        }
      } else {
        // fieldValue is id
        relatedEntityId = relatedEntityToBeSaved;
        const targetEntity = await targetDataAccessor.findById(relatedEntityId);
        if (!targetEntity) {
          throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`);
        }

        if (property.linkTableName) {
          const command = `INSERT INTO ${server.queryBuilder.quoteTable({
            schema: property.linkSchema,
            tableName: property.linkTableName,
          })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
          const params = [newEntity.id, relatedEntityId];
          await server.queryDatabaseObject(command, params);
        } else {
          await targetDataAccessor.updateById(targetEntity.id, { [property.selfIdColumnName!]: newEntity.id });
          targetEntity[property.selfIdColumnName!] = newEntity.id;
        }

        newEntity[property.code].push(targetEntity);
      }
    }
  }

  await server.emitEvent({
    eventName: "entity.create",
    payload: {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      baseModelSingularCode: model.base,
      after: newEntity,
    },
    sender: plugin,
    routeContext,
  });

  return newEntity;
}

async function updateEntityById(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: UpdateEntityByIdOptions, plugin?: RapidPlugin) {
  const model = dataAccessor.getModel();
  const { id, routeContext } = options;
  if (!id) {
    throw new Error("Id is required when updating an entity.");
  }

  const entity = await findById(server, dataAccessor, {
    routeContext,
    id,
    keepNonPropertyFields: true,
  });
  if (!entity) {
    throw new Error(`${model.namespace}.${model.singularCode}  with id "${id}" was not found.`);
  }

  let { entityToSave } = options;
  let changes = getEntityPartChanges(server, model, entity, entityToSave);
  if (!changes && !options.operation) {
    return entity;
  }

  entityToSave = changes || {};

  const userId = options.routeContext?.state?.userId;
  if (userId) {
    const updatedByProperty = getEntityPropertyByCode(server, model, "updatedBy");
    if (updatedByProperty) {
      entityToSave.updatedBy = userId;
    }
  }
  const updatedAtProperty = getEntityPropertyByCode(server, model, "updatedAt");
  if (updatedAtProperty) {
    entityToSave.updatedAt = getNowStringWithTimezone();
  }

  await server.beforeUpdateEntity(model, options, entity);

  await server.emitEvent({
    eventName: "entity.beforeUpdate",
    payload: {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      before: entity,
      changes: entityToSave,
      operation: options.operation,
      stateProperties: options.stateProperties,
    },
    sender: plugin,
    routeContext: options.routeContext,
  });

  changes = getEntityPartChanges(server, model, entity, entityToSave);

  // check readonly properties
  Object.keys(changes).forEach((propertyName) => {
    let isReadonlyProperty = false;
    const property = getEntityPropertyByCode(server, model, propertyName);
    if (property && property.readonly) {
      isReadonlyProperty = true;
    } else {
      const oneRelationProperty = getEntityProperty(server, model, (item) => item.relation === "one" && item.targetIdColumnName === propertyName);
      if (oneRelationProperty && oneRelationProperty.readonly) {
        isReadonlyProperty = true;
      }
    }
    if (isReadonlyProperty) {
      throw new Error(`Updating "${property.name}" property is not allowed because it's readonly.`);
    }
  });

  // check unique constraints
  if (!options.postponeUniquenessCheck) {
    if (model.indexes && model.indexes.length) {
      for (const indexConfig of model.indexes) {
        if (!indexConfig.unique) {
          continue;
        }

        const duplicate = await willEntityDuplicate(server, dataAccessor, {
          routeContext: options.routeContext,
          entityId: id,
          entityToSave: changes,
          indexConfig,
        });
        if (duplicate) {
          throw new Error(getEntityDuplicatedErrorMessage(server, model, indexConfig));
        }
      }
    }
  }

  const oneRelationPropertiesToUpdate: RpdDataModelProperty[] = [];
  const manyRelationPropertiesToUpdate: RpdDataModelProperty[] = [];
  keys(changes).forEach((propertyCode) => {
    const property = getEntityPropertyByCode(server, model, propertyCode);
    if (!property) {
      // Unknown property
      return;
    }

    if (isRelationProperty(property)) {
      if (property.relation === "many") {
        manyRelationPropertiesToUpdate.push(property);
      } else {
        oneRelationPropertiesToUpdate.push(property);
      }
    }
  });

  const { row, baseRow } = mapEntityToDbRow(server, model, changes);

  const updatedEntityOneRelationProps = {};
  for (const property of oneRelationPropertiesToUpdate) {
    const rowToBeSaved = property.isBaseProperty ? baseRow : row;
    const fieldValue = changes[property.code];
    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });

    if (isObject(fieldValue)) {
      const targetEntityId = fieldValue["id"];
      if (!targetEntityId) {
        if (!property.selfIdColumnName) {
          const targetEntity = fieldValue;
          const newTargetEntity = await createEntity(server, targetDataAccessor, {
            routeContext,
            entity: targetEntity,
          });
          updatedEntityOneRelationProps[property.code] = newTargetEntity;
          rowToBeSaved[property.targetIdColumnName!] = newTargetEntity["id"];
        }
      } else {
        const targetEntity = await findById(server, targetDataAccessor, {
          id: targetEntityId,
          routeContext,
        });
        if (!targetEntity) {
          throw newEntityOperationError(
            `Create ${model.singularCode} entity failed. Property '${property.code}' was invalid. Related ${property.targetSingularCode} entity with id '${targetEntityId}' was not found.`,
          );
        }
        updatedEntityOneRelationProps[property.code] = targetEntity;
        rowToBeSaved[property.targetIdColumnName!] = targetEntityId;
      }
    } else if (isNumber(fieldValue) || isString(fieldValue)) {
      // fieldValue is id;
      const targetEntityId = fieldValue;
      const targetEntity = await findById(server, targetDataAccessor, {
        id: targetEntityId,
        routeContext,
      });
      if (!targetEntity) {
        throw newEntityOperationError(
          `Create ${model.singularCode} entity failed. Property '${property.code}' was invalid. Related ${property.targetSingularCode} entity with id '${targetEntityId}' was not found.`,
        );
      }
      updatedEntityOneRelationProps[property.code] = targetEntity;
      rowToBeSaved[property.targetIdColumnName!] = targetEntityId;
    } else {
      updatedEntityOneRelationProps[property.code] = null;
      rowToBeSaved[property.targetIdColumnName!] = null;
    }
  }

  let updatedRow = row;
  if (Object.keys(row).length) {
    updatedRow = await dataAccessor.updateById(id, row);
  }
  let updatedBaseRow = baseRow;
  let baseDataAccessor: any;
  if (model.base) {
    baseDataAccessor = server.getDataAccessor({
      singularCode: model.base,
    });
    if (Object.keys(baseRow).length) {
      updatedBaseRow = await baseDataAccessor.updateById(id, updatedBaseRow);
    }
  }

  let updatedEntity = mapDbRowToEntity(server, model, { ...updatedRow, ...updatedBaseRow, ...updatedEntityOneRelationProps }, true);
  updatedEntity = Object.assign({}, entity, updatedEntity);

  // save one-relation properties that has selfIdColumnName
  for (const property of oneRelationPropertiesToUpdate) {
    const fieldValue = changes[property.code];
    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });
    if (isObject(fieldValue)) {
      const targetEntityId = fieldValue["id"];
      if (!targetEntityId) {
        if (property.selfIdColumnName) {
          const targetEntity = fieldValue;
          targetEntity[property.selfIdColumnName] = updatedEntity.id;
          const newTargetEntity = await createEntity(server, targetDataAccessor, {
            routeContext,
            entity: targetEntity,
          });

          let dataAccessorOfMainEntity = dataAccessor;
          if (property.isBaseProperty) {
            dataAccessorOfMainEntity = baseDataAccessor;
          }

          const relationFieldChanges = {
            [property.targetIdColumnName]: newTargetEntity.id,
          };
          await dataAccessorOfMainEntity.updateById(updatedEntity.id, relationFieldChanges);
          updatedEntity[property.code] = newTargetEntity;
          changes[property.code] = newTargetEntity;
        }
      }
    }
  }

  // save many-relation properties
  for (const property of manyRelationPropertiesToUpdate) {
    const relatedEntities: any[] = [];
    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });

    const relatedEntitiesToBeSaved = changes[property.code];
    if (!isArray(relatedEntitiesToBeSaved)) {
      throw new Error(`Value of field '${property.code}' should be an array.`);
    }

    const targetIdsToKeep = [];
    for (const relatedEntityToBeSaved of relatedEntitiesToBeSaved) {
      let relatedEntityId: any;
      if (isObject(relatedEntityToBeSaved)) {
        relatedEntityId = relatedEntityToBeSaved["id"];
      } else {
        relatedEntityId = relatedEntityToBeSaved;
      }
      if (relatedEntityId) {
        targetIdsToKeep.push(relatedEntityId);
      }
    }

    let currentTargetIds: any[] = [];
    if (property.linkTableName) {
      const targetLinks = await server.queryDatabaseObject(
        `SELECT ${server.queryBuilder.quoteObject(property.targetIdColumnName)} FROM ${server.queryBuilder.quoteTable({
          schema: property.linkSchema,
          tableName: property.linkTableName,
        })} WHERE ${server.queryBuilder.quoteObject(property.selfIdColumnName!)} = $1`,
        [id],
      );
      currentTargetIds = targetLinks.map((item) => item[property.targetIdColumnName]);

      await server.queryDatabaseObject(
        `DELETE FROM ${server.queryBuilder.quoteTable({
          schema: property.linkSchema,
          tableName: property.linkTableName,
        })} WHERE ${server.queryBuilder.quoteObject(property.selfIdColumnName!)} = $1
              AND ${server.queryBuilder.quoteObject(property.targetIdColumnName!)} <> ALL($2::int[])`,
        [id, targetIdsToKeep],
      );
    } else {
      const targetModel = server.getModel({
        singularCode: property.targetSingularCode,
      });
      const targetRows = await server.queryDatabaseObject(
        `SELECT id FROM ${server.queryBuilder.quoteTable({
          schema: targetModel.schema,
          tableName: targetModel.tableName,
        })} WHERE ${server.queryBuilder.quoteObject(property.selfIdColumnName!)} = $1`,
        [id],
      );
      currentTargetIds = targetRows.map((item) => item.id);
    }

    for (const relatedEntityToBeSaved of relatedEntitiesToBeSaved) {
      let relatedEntityId: any;
      if (isObject(relatedEntityToBeSaved)) {
        relatedEntityId = relatedEntityToBeSaved["id"];
        if (!relatedEntityId) {
          // related entity is to be created
          const targetEntity = relatedEntityToBeSaved;
          if (!property.linkTableName) {
            targetEntity[property.selfIdColumnName!] = id;
          }
          const newTargetEntity = await createEntity(server, targetDataAccessor, {
            routeContext,
            entity: targetEntity,
          });

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({
              schema: property.linkSchema,
              tableName: property.linkTableName,
            })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
            const params = [id, newTargetEntity.id];
            await server.queryDatabaseObject(command, params);
          }

          relatedEntities.push(newTargetEntity);
        } else {
          // related entity is existed
          const targetEntity = await targetDataAccessor.findById(relatedEntityId);
          if (!targetEntity) {
            throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`);
          }

          if (!currentTargetIds.includes(relatedEntityId)) {
            if (property.linkTableName) {
              const command = `INSERT INTO ${server.queryBuilder.quoteTable({
                schema: property.linkSchema,
                tableName: property.linkTableName,
              })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
              const params = [id, relatedEntityId];
              await server.queryDatabaseObject(command, params);
            } else {
              await targetDataAccessor.updateById(targetEntity.id, { [property.selfIdColumnName!]: id });
              targetEntity[property.selfIdColumnName!] = id;
            }
          }
          relatedEntities.push(targetEntity);
        }
      } else {
        // fieldValue is id
        relatedEntityId = relatedEntityToBeSaved;
        const targetEntity = await targetDataAccessor.findById(relatedEntityId);
        if (!targetEntity) {
          throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`);
        }

        if (!currentTargetIds.includes(relatedEntityId)) {
          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({
              schema: property.linkSchema,
              tableName: property.linkTableName,
            })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
            const params = [id, relatedEntityId];
            await server.queryDatabaseObject(command, params);
          } else {
            await targetDataAccessor.updateById(targetEntity.id, { [property.selfIdColumnName!]: id });
            targetEntity[property.selfIdColumnName!] = id;
          }
        }

        relatedEntities.push(targetEntity);
      }
    }
    updatedEntity[property.code] = relatedEntities;
  }

  await server.emitEvent({
    eventName: "entity.update",
    payload: {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      // TODO: should not emit event on base model if it's not effected.
      baseModelSingularCode: model.base,
      before: entity,
      after: updatedEntity,
      changes: changes,
      operation: options.operation,
      stateProperties: options.stateProperties,
    },
    sender: plugin,
    routeContext: options.routeContext,
  });

  return updatedEntity;
}

export type CheckEntityDuplicatedOptions = {
  routeContext?: RouteContext;
  entityId?: number;
  entityToSave: any;
  indexConfig: RpdDataModelIndex;
};

async function willEntityDuplicate(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: CheckEntityDuplicatedOptions): Promise<boolean> {
  const { entityId, entityToSave, routeContext, indexConfig } = options;

  let filters: EntityFilterOptions[] = [];
  if (indexConfig.conditions) {
    filters = cloneDeep(indexConfig.conditions);
  }

  for (const propConfig of indexConfig.properties) {
    let propCode: string;
    if (isString(propConfig)) {
      propCode = propConfig;
    } else {
      propCode = propConfig.code;
    }

    if (!entityToSave.hasOwnProperty(propCode)) {
      // skip duplicate checking when  any index prop missing in entityToSave.
      return false;
    }

    filters.push({
      operator: "eq",
      field: propCode,
      value: entityToSave[propCode],
    });
  }

  const entityInDb = await findEntity(server, dataAccessor, {
    filters,
    routeContext,
  });

  if (entityId) {
    return entityInDb && entityInDb.Id !== entityId;
  } else {
    return !!entityInDb;
  }
}

function getEntityDuplicatedErrorMessage(server: IRpdServer, model: RpdDataModel, indexConfig: RpdDataModelIndex) {
  const propertyNames = indexConfig.properties.map((propConfig) => {
    let propCode: string;
    if (isString(propConfig)) {
      propCode = propConfig;
    } else {
      propCode = propConfig.code;
    }
    const prop = getEntityPropertyByCode(server, model, propCode);
    return prop.name;
  });

  return `已存在 ${propertyNames.join(", ")} 相同的记录。`;
}

export default class EntityManager<TEntity = any> {
  #server: IRpdServer;
  #dataAccessor: IRpdDataAccessor;

  constructor(server: IRpdServer, dataAccessor: IRpdDataAccessor) {
    this.#server = server;
    this.#dataAccessor = dataAccessor;
  }

  getModel(): RpdDataModel {
    return this.#dataAccessor.getModel();
  }

  async findEntities(options: FindEntityOptions): Promise<TEntity[]> {
    return await findEntities(this.#server, this.#dataAccessor, options);
  }

  async findEntity(options: FindEntityOptions): Promise<TEntity | null> {
    return await findEntity(this.#server, this.#dataAccessor, options);
  }

  async findById(options: FindEntityByIdOptions | string | number): Promise<TEntity | null> {
    // options is id
    if (!isObject(options)) {
      options = {
        id: options,
      };
    }
    return await findById(this.#server, this.#dataAccessor, options);
  }

  async createEntity(options: CreateEntityOptions, plugin?: RapidPlugin): Promise<TEntity> {
    return await createEntity(this.#server, this.#dataAccessor, options, plugin);
  }

  async updateEntityById(options: UpdateEntityByIdOptions, plugin?: RapidPlugin): Promise<TEntity> {
    return await updateEntityById(this.#server, this.#dataAccessor, options, plugin);
  }

  async count(options: CountEntityOptions): Promise<CountEntityResult> {
    const model = this.#dataAccessor.getModel();
    let baseModel: RpdDataModel;
    if (model.base) {
      baseModel = this.#server.getModel({
        singularCode: model.base,
      });
    }
    const countRowOptions: CountRowOptions = {
      filters: await convertEntityFiltersToRowFilters(this.#server, model, baseModel, options.filters),
    };
    return await this.#dataAccessor.count(countRowOptions);
  }

  async deleteById(options: DeleteEntityByIdOptions | string | number, plugin?: RapidPlugin): Promise<void> {
    // options is id
    if (!isObject(options)) {
      options = {
        id: options,
      };
    }

    const model = this.getModel();
    if (model.derivedTypePropertyCode) {
      throw newEntityOperationError("Delete base entity directly is not allowed.");
    }

    const { id, routeContext } = options;

    const entity = await this.findById({
      id,
      keepNonPropertyFields: true,
      routeContext,
    });

    if (!entity) {
      return;
    }

    await this.#server.emitEvent({
      eventName: "entity.beforeDelete",
      payload: {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        before: entity,
      },
      sender: plugin,
      routeContext,
    });

    await this.#dataAccessor.deleteById(id);
    if (model.base) {
      const baseDataAccessor = this.#server.getDataAccessor({
        singularCode: model.base,
      });
      await baseDataAccessor.deleteById(id);
    }

    await this.#server.emitEvent({
      eventName: "entity.delete",
      payload: {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        before: entity,
      },
      sender: plugin,
      routeContext,
    });
  }

  async addRelations(options: AddEntityRelationsOptions, plugin?: RapidPlugin): Promise<void> {
    const server = this.#server;
    const model = this.getModel();
    const { id, property, relations, routeContext } = options;
    const entity = await this.findById({
      id,
      routeContext,
    });
    if (!entity) {
      throw new Error(`${model.namespace}.${model.singularCode}  with id "${id}" was not found.`);
    }

    const relationProperty = getEntityPropertyByCode(server, model, property);
    if (!relationProperty) {
      throw new Error(`Property '${property}' was not found in ${model.namespace}.${model.singularCode}`);
    }

    if (!(isRelationProperty(relationProperty) && relationProperty.relation === "many")) {
      throw new Error(`Operation 'addRelations' is only supported on property of 'many' relation`);
    }

    const { queryBuilder } = server;
    if (relationProperty.linkTableName) {
      for (const relation of relations) {
        const command = `INSERT INTO ${queryBuilder.quoteTable({
          schema: relationProperty.linkSchema,
          tableName: relationProperty.linkTableName,
        })} (${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}, ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)})
    SELECT $1, $2 WHERE NOT EXISTS (
      SELECT ${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}, ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)}
        FROM ${queryBuilder.quoteTable({ schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName })}
        WHERE ${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}=$1 AND ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)}=$2
      )`;
        const params = [id, relation.id];
        await server.queryDatabaseObject(command, params);
      }
    }

    await server.emitEvent({
      eventName: "entity.addRelations",
      payload: {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        entity,
        property,
        relations,
      },
      sender: plugin,
      routeContext: options.routeContext,
    });
  }

  async removeRelations(options: RemoveEntityRelationsOptions, plugin?: RapidPlugin): Promise<void> {
    const server = this.#server;
    const model = this.getModel();
    const { id, property, relations, routeContext } = options;
    const entity = await this.findById({
      id,
      routeContext,
    });
    if (!entity) {
      throw new Error(`${model.namespace}.${model.singularCode}  with id "${id}" was not found.`);
    }

    const relationProperty = getEntityPropertyByCode(server, model, property);
    if (!relationProperty) {
      throw new Error(`Property '${property}' was not found in ${model.namespace}.${model.singularCode}`);
    }

    if (!(isRelationProperty(relationProperty) && relationProperty.relation === "many")) {
      throw new Error(`Operation 'removeRelations' is only supported on property of 'many' relation`);
    }

    const { queryBuilder } = server;
    if (relationProperty.linkTableName) {
      for (const relation of relations) {
        const command = `DELETE FROM ${queryBuilder.quoteTable({ schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName })}
    WHERE ${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}=$1 AND ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)}=$2;`;
        const params = [id, relation.id];
        await server.queryDatabaseObject(command, params);
      }
    }

    await server.emitEvent({
      eventName: "entity.removeRelations",
      payload: {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        entity,
        property,
        relations,
      },
      sender: plugin,
      routeContext: options.routeContext,
    });
  }
}
