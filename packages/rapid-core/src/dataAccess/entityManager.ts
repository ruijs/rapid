import {
  AddEntityRelationsOptions,
  CountEntityOptions,
  CountEntityResult,
  CreateEntityOptions,
  EntityFilterOperators,
  EntityFilterOptions,
  EntityNonRelationPropertyFilterOptions,
  FindEntityOptions,
  FindEntityOrderByOptions,
  IRpdDataAccessor,
  RemoveEntityRelationsOptions,
  RpdDataModel,
  RpdDataModelProperty,
  UpdateEntityByIdOptions,
} from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { mapDbRowToEntity, mapEntityToDbRow } from "./entityMapper";
import { mapPropertyNameToColumnName } from "./propertyMapper";
import { isRelationProperty } from "~/utilities/rapidUtility";
import { IRpdServer, RapidPlugin } from "~/core/server";
import { getEntityPartChanges } from "~/helpers/entityHelpers";
import { filter, find, first, forEach, isArray, isObject, keys, map, reject, uniq } from "lodash";
import { getEntityPropertiesIncludingBase, getEntityProperty, getEntityPropertyByCode } from "./metaHelper";
import { ColumnQueryOptions, CountRowOptions, FindRowOptions, FindRowOrderByOptions, RowFilterOptions } from "./dataAccessTypes";
import { newEntityOperationError } from "~/utilities/errorUtility";

function convertEntityOrderByToRowOrderBy(server: IRpdServer, model: RpdDataModel, baseModel?: RpdDataModel, orderByList?: FindEntityOrderByOptions[]) {
  if (!orderByList) {
    return null;
  }

  return orderByList.map((orderBy) => {
    let property = getEntityPropertyByCode(server, model, orderBy.field);
    if (!property) {
      property = getEntityProperty(server, model, (item) => item.relation === "one" && item.targetIdColumnName === orderBy.field);
    }

    if (!property) {
      throw new Error(`Unkown orderBy field '${orderBy.field}'`);
    }

    return {
      field: {
        name: mapPropertyNameToColumnName(model, orderBy.field),
        tableName: property.isBaseProperty ? baseModel.tableName : model.tableName,
      },
      desc: !!orderBy.desc,
    } as FindRowOrderByOptions;
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

  let propertiesToSlect: RpdDataModelProperty[];
  if (!options.properties || !options.properties.length) {
    propertiesToSlect = getEntityPropertiesIncludingBase(server, model).filter(property => !isRelationProperty(property));
  } else {
    propertiesToSlect = getEntityPropertiesIncludingBase(server, model).filter(property => options.properties.includes(property.code));
  }

  const columnsToSelect: ColumnQueryOptions[] = [];

  const relationPropertiesToSelect: RpdDataModelProperty[] = [];
  forEach(propertiesToSlect, (property) => {
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

  const rowFilters = await convertEntityFiltersToRowFilters(server, model, baseModel, options.filters);
  const findRowOptions: FindRowOptions = {
    filters: rowFilters,
    orderBy: convertEntityOrderByToRowOrderBy(server, model, baseModel, options.orderBy),
    pagination: options.pagination,
    fields: columnsToSelect,
  };
  const entities = await dataAccessor.find(findRowOptions);
  if (!entities.length) {
    return [];
  }

  const entityIds = entities.map((e) => e.id);
  if (relationPropertiesToSelect.length) {
    for (const relationProperty of relationPropertiesToSelect) {
      const isManyRelation = relationProperty.relation === "many";

      if (relationProperty.linkTableName) {
        const targetModel = server.getModel({ singularCode: relationProperty.targetSingularCode! });
        if (!targetModel) {
          continue;
        }

        if (isManyRelation) {
          const relationLinks = await findManyRelationLinksViaLinkTable(server, targetModel, relationProperty, entityIds);

          forEach(entities, (entity: any) => {
            entity[relationProperty.code] = filter(relationLinks, (link: any) => {
              return link[relationProperty.selfIdColumnName!] == entity["id"];
            }).map((link) => mapDbRowToEntity(server, targetModel, link.targetEntity, false));
          });
        }
      } else {
        let relatedEntities: any[];
        if (isManyRelation) {
          relatedEntities = await findManyRelatedEntitiesViaIdPropertyCode(server, model, relationProperty, entityIds);
        } else {
          const targetEntityIds = uniq(
            reject(
              map(entities, (entity: any) => entity[relationProperty.targetIdColumnName!]),
              isNullOrUndefined,
            ),
          );
          relatedEntities = await findOneRelatedEntitiesViaIdPropertyCode(server, model, relationProperty, targetEntityIds);
        }

        const targetModel = server.getModel({
          singularCode: relationProperty.targetSingularCode!,
        });
        entities.forEach((entity) => {
          if (isManyRelation) {
            entity[relationProperty.code] = filter(relatedEntities, (relatedEntity: any) => {
              return relatedEntity[relationProperty.selfIdColumnName!] == entity.id;
            }).map((item) => mapDbRowToEntity(server, targetModel!, item, false));
          } else {
            entity[relationProperty.code] = mapDbRowToEntity(
              server,
              targetModel!,
              find(relatedEntities, (relatedEntity: any) => {
                // TODO: id property code should be configurable.
                return relatedEntity["id"] == entity[relationProperty.targetIdColumnName!];
              }),
              false,
            );
          }
        });
      }
    }
  }
  return entities.map((item) => mapDbRowToEntity(server, model, item, options.keepNonPropertyFields));
}

async function findEntity(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: FindEntityOptions) {
  const entities = await findEntities(server, dataAccessor, options);
  return first(entities);
}

async function findById(server: IRpdServer, dataAccessor: IRpdDataAccessor, id: any, keepNonPropertyFields: boolean = false): Promise<any> {
  return await findEntity(server, dataAccessor, {
    filters: [
      {
        operator: "eq",
        field: "id",
        value: id,
      },
    ],
    keepNonPropertyFields,
  });
}

async function convertEntityFiltersToRowFilters(server: IRpdServer, model: RpdDataModel, baseModel: RpdDataModel, filters: EntityFilterOptions[] | undefined): Promise<RowFilterOptions[]> {
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
        throw new Error(`Invalid filters. Filter with 'existence' operator on property '${filter.field}' is not allowed. You can only use it on an relation property.`);
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

        const command = `SELECT * FROM ${server.queryBuilder.quoteTable({ schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName! })} WHERE ${server.queryBuilder.quoteObject(relationProperty.targetIdColumnName!)} = ANY($1::int[])`;
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
      const property: RpdDataModelProperty = getEntityPropertyByCode(server, model, (filter as EntityNonRelationPropertyFilterOptions).field);
      // TODO: do not use `any` here
      replacedFilters.push({
        operator: filter.operator,
        field: {
          name: property.columnName || property.code,
          tableName: property.isBaseProperty ? baseModel.tableName : model.tableName,
        },
        value: (filter as any).value,
        itemType: (filter as any).itemType,
      } as any);
    }
  }
  return replacedFilters;
}

async function findManyRelationLinksViaLinkTable(server: IRpdServer, targetModel: RpdDataModel, relationProperty: RpdDataModelProperty, entityIds: any[]) {
  const command = `SELECT * FROM ${server.queryBuilder.quoteTable({ schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName! })} WHERE ${server.queryBuilder.quoteObject(relationProperty.selfIdColumnName!)} = ANY($1::int[])`;
  const params = [entityIds];
  const links = await server.queryDatabaseObject(command, params);
  const targetEntityIds = links.map((link) => link[relationProperty.targetIdColumnName!]);
  const findEntityOptions: FindRowOptions = {
    filters: [
      {
        field: {
          name: "id",
        },
        operator: "in",
        value: targetEntityIds,
      },
    ],
  };
  const dataAccessor = server.getDataAccessor({
    namespace: targetModel.namespace,
    singularCode: targetModel.singularCode,
  });
  const targetEntities = await dataAccessor.find(findEntityOptions);

  forEach(links, (link: any) => {
    link.targetEntity = find(targetEntities, (e: any) => e["id"] == link[relationProperty.targetIdColumnName!]);
  });

  return links;
}

function findManyRelatedEntitiesViaIdPropertyCode(server: IRpdServer, model: RpdDataModel, relationProperty: RpdDataModelProperty, entityIds: any[]) {
  const findEntityOptions: FindRowOptions = {
    filters: [
      {
        field: {
          name: relationProperty.selfIdColumnName,
        },
        operator: "in",
        value: entityIds,
      },
    ],
  };
  const dataAccessor = server.getDataAccessor({
    singularCode: relationProperty.targetSingularCode as string,
  });

  return dataAccessor.find(findEntityOptions);
}

function findOneRelatedEntitiesViaIdPropertyCode(server: IRpdServer, model: RpdDataModel, relationProperty: RpdDataModelProperty, targetEntityIds: any[]) {
  const findEntityOptions: FindRowOptions = {
    filters: [
      {
        field: {
          name: "id",
        },
        operator: "in",
        value: targetEntityIds,
      },
    ],
  };
  const dataAccessor = server.getDataAccessor({
    singularCode: relationProperty.targetSingularCode as string,
  });

  return dataAccessor.find(findEntityOptions);
}

async function createEntity(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: CreateEntityOptions, plugin?: RapidPlugin) {
  const model = dataAccessor.getModel();
  if (model.derivedTypePropertyCode) {
    throw newEntityOperationError("Create base entity directly is not allowed.");
  }

  const { entity } = options;

  await server.beforeCreateEntity(model, options);

  await server.emitEvent(
    "entity.beforeCreate",
    {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      baseModelSingularCode: model.base,
      before: entity,
    },
    plugin,
  );

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

  // save one-relation properties
  for (const property of oneRelationPropertiesToCreate) {
    const targetRow = property.isBaseProperty ? baseRow : row;
    const fieldValue = entity[property.code];
    if (isObject(fieldValue)) {
      if (!fieldValue["id"]) {
        const targetDataAccessor = server.getDataAccessor({
          singularCode: property.targetSingularCode!,
        });
        const targetEntity = fieldValue;
        const newTargetEntity = await createEntity(server, targetDataAccessor, {
          entity: targetEntity,
        });
        targetRow[property.targetIdColumnName!] = newTargetEntity["id"];
      } else {
        targetRow[property.targetIdColumnName!] = fieldValue["id"];
      }
    } else {
      // fieldValue is id;
      targetRow[property.targetIdColumnName!] = fieldValue;
    }
  }

  let newBaseRow: any;
  if (model.base) {
    const baseDataAccessor = server.getDataAccessor({
      singularCode: model.base,
    });
    newBaseRow = await baseDataAccessor.create(baseRow);

    row.id = newBaseRow.id;
  }
  const newRow = await dataAccessor.create(row);
  const newEntity = mapDbRowToEntity(server, model, Object.assign(newBaseRow, newRow), true);

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
            entity: targetEntity,
          });

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({ schema: property.linkSchema, tableName: property.linkTableName })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
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
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({ schema: property.linkSchema, tableName: property.linkTableName })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
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
          const command = `INSERT INTO ${server.queryBuilder.quoteTable({ schema: property.linkSchema, tableName: property.linkTableName })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
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

  await server.emitEvent(
    "entity.create",
    {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      baseModelSingularCode: model.base,
      after: newEntity,
    },
    plugin,
  );

  return newEntity;
}

async function updateEntityById(server: IRpdServer, dataAccessor: IRpdDataAccessor, options: UpdateEntityByIdOptions, plugin?: RapidPlugin) {
  const model = dataAccessor.getModel();
  const { id, entityToSave } = options;
  if (!id) {
    throw new Error("Id is required when updating an entity.");
  }

  const entity = await findById(server, dataAccessor, id);
  if (!entity) {
    throw new Error(`${model.namespace}.${model.singularCode}  with id "${id}" was not found.`);
  }

  let changes = getEntityPartChanges(entity, entityToSave);
  if (!changes && !options.operation) {
    return entity;
  }

  options.entityToSave = changes || {};
  await server.beforeUpdateEntity(model, options, entity);

  await server.emitEvent(
    "entity.beforeUpdate",
    {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      before: entity,
      changes: options.entityToSave,
    },
    plugin,
  );

  changes = getEntityPartChanges(entity, options.entityToSave);

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
  oneRelationPropertiesToUpdate.forEach((property) => {
    const targetRow = property.isBaseProperty ? baseRow : row;
    const fieldValue = changes[property.code];
    if (isObject(fieldValue)) {
      targetRow[property.targetIdColumnName!] = fieldValue["id"];
    } else {
      targetRow[property.targetIdColumnName!] = fieldValue;
    }
  });
  let updatedRow = row;
  if (Object.keys(row).length) {
    updatedRow = await dataAccessor.updateById(id, row);
  }
  let updatedBaseRow = baseRow;
  if (model.base && Object.keys(baseRow).length) {
    const baseDataAccessor = server.getDataAccessor({
      singularCode: model.base,
    });
    updatedBaseRow = await baseDataAccessor.updateById(id, updatedBaseRow);
  }

  let updatedEntity = mapDbRowToEntity(server, model, {...updatedRow, ...updatedBaseRow}, true);
  updatedEntity = Object.assign({}, entity, updatedEntity);

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

    if (property.linkTableName) {
      // TODO: should support removing relation
      await server.queryDatabaseObject(`DELETE FROM ${server.queryBuilder.quoteTable({ schema: property.linkSchema, tableName: property.linkTableName })} WHERE ${server.queryBuilder.quoteObject(property.selfIdColumnName!)} = $1`, [id]);
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
            entity: targetEntity,
          });

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({ schema: property.linkSchema, tableName: property.linkTableName })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
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

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({ schema: property.linkSchema, tableName: property.linkTableName })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
            const params = [id, relatedEntityId];
            await server.queryDatabaseObject(command, params);
          } else {
            await targetDataAccessor.updateById(targetEntity.id, { [property.selfIdColumnName!]: id });
            targetEntity[property.selfIdColumnName!] = id;
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

        if (property.linkTableName) {
          const command = `INSERT INTO ${server.queryBuilder.quoteTable({ schema: property.linkSchema, tableName: property.linkTableName })} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`;
          const params = [id, relatedEntityId];
          await server.queryDatabaseObject(command, params);
        } else {
          await targetDataAccessor.updateById(targetEntity.id, { [property.selfIdColumnName!]: id });
          targetEntity[property.selfIdColumnName!] = id;
        }

        relatedEntities.push(targetEntity);
      }
    }
    updatedEntity[property.code] = relatedEntities;
  }

  await server.emitEvent(
    "entity.update",
    {
      namespace: model.namespace,
      modelSingularCode: model.singularCode,
      // TODO: should not emit event on base model if it's not effected.
      baseModelSingularCode: model.base,
      before: entity,
      after: updatedEntity,
      changes: changes,
    },
    plugin,
  );
  return updatedEntity;
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

  async findById(id: any, keepNonPropertyFields: boolean = false): Promise<TEntity | null> {
    return await findById(this.#server, this.#dataAccessor, id, keepNonPropertyFields);
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
    }
    return await this.#dataAccessor.count(countRowOptions);
  }

  async deleteById(id: any, plugin?: RapidPlugin): Promise<void> {
    const model = this.getModel();
    if (model.derivedTypePropertyCode) {
      throw newEntityOperationError("Delete base entity directly is not allowed.");
    }

    const entity = await this.findById(id, true);
    if (!entity) {
      return;
    }

    await this.#server.emitEvent(
      "entity.beforeDelete",
      {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        before: entity,
      },
      plugin,
    );

    await this.#dataAccessor.deleteById(id);
    if (model.base) {
      const baseDataAccessor = this.#server.getDataAccessor({
        singularCode: model.base,
      });
      await baseDataAccessor.deleteById(id);
    }

    await this.#server.emitEvent(
      "entity.delete",
      {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        baseModelSingularCode: model.base,
        before: entity,
      },
      plugin,
    );
  }

  async addRelations(options: AddEntityRelationsOptions, plugin?: RapidPlugin): Promise<void> {
    const server = this.#server;
    const model = this.getModel();
    const { id, property, relations } = options;
    const entity = await this.findById(id);
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
        const command = `INSERT INTO ${queryBuilder.quoteTable({ schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName })} (${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}, ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)})
    SELECT $1, $2 WHERE NOT EXISTS (
      SELECT ${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}, ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)}
        FROM ${queryBuilder.quoteTable({ schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName })}
        WHERE ${queryBuilder.quoteObject(relationProperty.selfIdColumnName!)}=$1 AND ${queryBuilder.quoteObject(relationProperty.targetIdColumnName!)}=$2
      )`;
        const params = [id, relation.id];
        await server.queryDatabaseObject(command, params);
      }
    }

    await server.emitEvent(
      "entity.addRelations",
      {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        entity,
        property,
        relations,
      },
      plugin,
    );
  }

  async removeRelations(options: RemoveEntityRelationsOptions, plugin?: RapidPlugin): Promise<void> {
    const server = this.#server;
    const model = this.getModel();
    const { id, property, relations } = options;
    const entity = await this.findById(id);
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

    await server.emitEvent(
      "entity.removeRelations",
      {
        namespace: model.namespace,
        modelSingularCode: model.singularCode,
        entity,
        property,
        relations,
      },
      plugin,
    );
  }
}
