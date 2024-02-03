import * as _ from "lodash";
import {
  CreateEntityOptions,
  EntityFilterOperators,
  EntityFilterOptions,
  FindEntityOptions,
  FindEntityOrderByOptions,
  IRpdDataAccessor,
  RpdDataModel,
  RpdDataModelProperty,
  UpdateEntityByIdOptions,
} from "~/types";
import { isNullOrUndefined } from "~/utilities/typeUtility";
import { mapDbRowToEntity, mapEntityToDbRow } from "./entityMapper";
import { mapPropertyNameToColumnName } from "./propertyMapper";
import { isRelationProperty } from "~/utilities/rapidUtility";
import { IRpdServer } from "~/core/server";

function convertToDataAccessOrderBy(model: RpdDataModel, orderByList?: FindEntityOrderByOptions[]) {
  if (!orderByList) {
    return orderByList;
  }

  return orderByList.map(orderBy => {
    return {
      field:  mapPropertyNameToColumnName(model, orderBy.field),
      desc: !!orderBy.desc,
    } as FindEntityOrderByOptions
  })
}

export async function findEntities(
  server: IRpdServer,
  dataAccessor: IRpdDataAccessor,
  options: FindEntityOptions,
) {
  const model = dataAccessor.getModel();
  const fieldsToSelect: string[] = [];
  const relationPropertiesToSelect: RpdDataModelProperty[] = [];
  if (options.properties) {
    _.forEach(options.properties, (propertyCode: string) => {
      const property = model.properties.find((e) => e.code === propertyCode);
      if (!property) {
        throw new Error(
          `Collection '${model.namespace}.${model.singularCode}' does not have a property '${propertyCode}'.`,
        );
      }

      if (isRelationProperty(property)) {
        relationPropertiesToSelect.push(property);

        if (property.relation === "one" && !property.linkTableName) {
          if (!property.targetIdColumnName) {
            throw new Error(
              `'targetIdColumnName' should be configured for property '${propertyCode}' of model '${model.namespace}.${model.singularCode}'.`,
            );
          }
          fieldsToSelect.push(property.targetIdColumnName);
        }
      } else {
        fieldsToSelect.push(property.columnName || property.code);
      }
    });
  }

  const processedFilters = await replaceFiltersWithFiltersOperator(
    server,
    model,
    options.filters,
  );

  const findEntityOptions: FindEntityOptions = {
    filters: processedFilters,
    orderBy: convertToDataAccessOrderBy(model, options.orderBy),
    pagination: options.pagination,
    properties: fieldsToSelect,
  };
  const entities = await dataAccessor.find(findEntityOptions);
  if (!entities.length) {
    return entities;
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
          const relationLinks = await findManyRelationLinksViaLinkTable(
            server,
            targetModel,
            relationProperty,
            entityIds,
          ); 

          _.forEach(entities, (entity: any) => {
            entity[relationProperty.code] = _.filter(relationLinks, (link: any) => {
              return link[relationProperty.selfIdColumnName!] == entity["id"];
            }).map(link => mapDbRowToEntity(targetModel, link.targetEntity));
          });
        }
      } else {
        let relatedEntities: any[];
        if (isManyRelation) {
          relatedEntities = await findManyRelatedEntitiesViaIdPropertyCode(
            server,
            model,
            relationProperty,
            entityIds,
          );
        } else {
          const targetEntityIds = _.uniq(
            _.reject(
              _.map(
                entities,
                (entity: any) => entity[relationProperty.targetIdColumnName!],
              ),
              isNullOrUndefined,
            ),
          );
          relatedEntities = await findOneRelatedEntitiesViaIdPropertyCode(
            server,
            model,
            relationProperty,
            targetEntityIds,
          );
        }

        const targetModel = server.getModel({
          singularCode: relationProperty.targetSingularCode!,
        });
        entities.forEach((entity) => {
          if (isManyRelation) {
            entity[relationProperty.code] = _.filter(
              relatedEntities,
              (relatedEntity: any) => {
                return relatedEntity[relationProperty.selfIdColumnName!] == entity.id;
              },
            ).map(item => mapDbRowToEntity(targetModel!, item));
          } else {
            entity[relationProperty.code] = mapDbRowToEntity(targetModel!, _.find(
              relatedEntities,
              (relatedEntity: any) => {
                // TODO: id property code should be configurable.
                return relatedEntity["id"] == entity[relationProperty.targetIdColumnName!];
              },
            ));
          }
        });
      }
    }
  }
  return entities.map(item => mapDbRowToEntity(model, item));
}

export async function findEntity(
  server: IRpdServer,
  dataAccessor: IRpdDataAccessor,
  options: FindEntityOptions,
) {
  const entities = await findEntities(server, dataAccessor, options);
  return _.first(entities);
}

async function replaceFiltersWithFiltersOperator(
  server: IRpdServer,
  model: RpdDataModel,
  filters: EntityFilterOptions[] | undefined,
) {
  if (!filters || !filters.length) {
    return [];
  }

  const replacedFilters: EntityFilterOptions[] = [];
  for (const filter of filters) {
    const { operator } = filter;
    if (operator === "and" || operator === "or") {
      filter.filters = await replaceFiltersWithFiltersOperator(
        server,
        model,
        filter.filters,
      );
      replacedFilters.push(filter);
    } else if (operator === "exists" || operator === "notExists") {
      const relationProperty: RpdDataModelProperty = _.find(
        model.properties,
        (property: RpdDataModelProperty) => property.code === filter.field,
      );
      if (!relationProperty) {
        throw new Error(
          `Invalid filters. Property '${filter.field}' was not found in model '${model.namespace}.${model.singularCode}'`,
        );
      }
      if (!isRelationProperty(relationProperty)) {
        throw new Error(
          `Invalid filters. Filter with 'existence' operator on property '${filter.field}' is not allowed. You can only use it on an relation property.`,
        );
      }

      const relatedEntityFilters = filter.filters;
      if (!relatedEntityFilters || !relatedEntityFilters.length) {
        throw new Error(
          `Invalid filters. 'filters' must be provided on filter with 'existence' operator.`,
        );
      }


      if (relationProperty.relation === "one") {
        // Optimize when filtering by id of related entity
        if (relatedEntityFilters.length === 1) {
          const relatedEntityIdFilter = relatedEntityFilters[0];
          if (
            (relatedEntityIdFilter.operator === "eq" ||
              relatedEntityIdFilter.operator === "in") &&
            relatedEntityIdFilter.field === "id"
          ) {
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
              field: relationProperty.targetIdColumnName as string,
              operator: replacedOperator,
              value: relatedEntityIdFilter.value,
            });
            continue;
          }
        }

        const dataAccessor = server.getDataAccessor({
          singularCode: relationProperty.targetSingularCode as string,
        });
        const entities = await dataAccessor.find({
          filters: filter.filters,
          properties: ["id"],
        });
        const entityIds = _.map(entities, (entity: any) => entity["id"]);
        replacedFilters.push({
          field: relationProperty.targetIdColumnName as string,
          operator: operator === "exists" ? "in" : "notIn",
          value: entityIds,
        });
      } else if (!relationProperty.linkTableName) {
        // many relation without link table.
        if (!relationProperty.selfIdColumnName) {
          throw new Error(
            `Invalid filters. 'selfIdColumnName' of property '${relationProperty.code}' was not configured`,
          );
        }

        const targetEntityDataAccessor = server.getDataAccessor({
          singularCode: relationProperty.targetSingularCode as string,
        });

        const targetEntities = await targetEntityDataAccessor.find({
          filters: filter.filters,
          properties: [relationProperty.selfIdColumnName],
        });
        const selfEntityIds = _.map(targetEntities, (entity: any) => entity[relationProperty.selfIdColumnName!]);
        replacedFilters.push({
          field: "id",
          operator: operator === "exists" ? "in" : "notIn",
          value: selfEntityIds,
        });
      } else {
        // many relation with link table
        if (!relationProperty.selfIdColumnName) {
          throw new Error(
            `Invalid filters. 'selfIdColumnName' of property '${relationProperty.code}' was not configured`,
          );
        }

        if (!relationProperty.targetIdColumnName) {
          throw new Error(
            `Invalid filters. 'targetIdColumnName' of property '${relationProperty.code}' was not configured`,
          );
        }

        // 1. find target entities
        // 2. find links
        // 3. convert to 'in' filter
        const targetEntityDataAccessor = server.getDataAccessor({
          singularCode: relationProperty.targetSingularCode as string,
        });

        const targetEntities = await targetEntityDataAccessor.find({
          filters: filter.filters,
          properties: ['id'],
        });
        const targetEntityIds = _.map(targetEntities, (entity: any) => entity['id']);

        const command = `SELECT * FROM ${server.queryBuilder.quoteTable({schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName!})} WHERE ${server.queryBuilder.quoteObject(relationProperty.targetIdColumnName!)} = ANY($1::int[])`;
        const params = [targetEntityIds];
        const links = await server.queryDatabaseObject(command, params);
        const selfEntityIds = links.map(link => link[relationProperty.selfIdColumnName!]);
        replacedFilters.push({
          field: "id",
          operator: operator === "exists" ? "in" : "notIn",
          value: selfEntityIds,
        });
      }
    } else {
      replacedFilters.push(filter);
    }
  }
  return replacedFilters;
}

async function findManyRelationLinksViaLinkTable(
  server: IRpdServer,
  targetModel: RpdDataModel,
  relationProperty: RpdDataModelProperty,
  entityIds: any[],
) {


  const command = `SELECT * FROM ${server.queryBuilder.quoteTable({schema: relationProperty.linkSchema, tableName: relationProperty.linkTableName!})} WHERE ${server.queryBuilder.quoteObject(relationProperty.selfIdColumnName!)} = ANY($1::int[])`;
  const params = [entityIds];
  const links = await server.queryDatabaseObject(command, params);
  const targetEntityIds = links.map(link => link[relationProperty.targetIdColumnName!]);
  const findEntityOptions: FindEntityOptions = {
    filters: [
      {
        field: "id",
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

  _.forEach(links, (link: any) => {
    link.targetEntity = _.find(targetEntities, (e: any) => e["id"] == link[relationProperty.targetIdColumnName!]);
  });

  return links;
}

function findManyRelatedEntitiesViaIdPropertyCode(
  server: IRpdServer,
  model: RpdDataModel,
  relationProperty: RpdDataModelProperty,
  entityIds: any[],
) {
  const findEntityOptions: FindEntityOptions = {
    filters: [
      {
        field: relationProperty.selfIdColumnName as string,
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

function findOneRelatedEntitiesViaIdPropertyCode(
  server: IRpdServer,
  model: RpdDataModel,
  relationProperty: RpdDataModelProperty,
  targetEntityIds: any[],
) {
  const findEntityOptions: FindEntityOptions = {
    filters: [
      {
        field: "id",
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

export async function createEntity(
  server: IRpdServer,
  dataAccessor: IRpdDataAccessor,
  options: CreateEntityOptions,
) {
  const model = dataAccessor.getModel();
  const { entity } = options;

  const oneRelationPropertiesToCreate: RpdDataModelProperty[] = [];
  const manyRelationPropertiesToCreate: RpdDataModelProperty[] = [];
  _.keys(entity).forEach((propertyCode) => {
    const property = model.properties.find((e) => e.code === propertyCode);
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
  })

  const row = mapEntityToDbRow(model, entity);

  // save one-relation properties
  for (const property of oneRelationPropertiesToCreate) {
    const fieldValue = entity[property.code];
    if (_.isObject(fieldValue)) {
      if (!fieldValue["id"]) {
        const targetDataAccessor = server.getDataAccessor({
          singularCode: property.targetSingularCode!,
        });
        const targetEntity = fieldValue;
        const newTargetEntity = await createEntity(server, targetDataAccessor, {
          entity: targetEntity,
        });
        row[property.targetIdColumnName!] = newTargetEntity["id"];
      } else {
        row[property.targetIdColumnName!] = fieldValue["id"];
      }
    } else {
      // fieldValue is id;
      row[property.targetIdColumnName!] = fieldValue;
    }
  }

  const newRow = await dataAccessor.create(row);
  const newEntity = mapDbRowToEntity(model, newRow);


  // save many-relation properties
  for (const property of manyRelationPropertiesToCreate) {
    newEntity[property.code] = [];

    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });

    const relatedEntitiesToBeSaved = entity[property.code];
    if (!_.isArray(relatedEntitiesToBeSaved)) {
      throw new Error(`Value of field '${property.code}' should be an array.`);
    }

    for (const relatedEntityToBeSaved of relatedEntitiesToBeSaved) {
      let relatedEntityId: any;
      if (_.isObject(relatedEntityToBeSaved)) {
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
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({schema:property.linkSchema, tableName: property.linkTableName})} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`
            const params = [newEntity.id, newTargetEntity.id];
            await server.queryDatabaseObject(command, params);
          }

          newEntity[property.code].push(newTargetEntity);
        } else {
          // related entity is existed
          const targetEntity = await targetDataAccessor.findById(relatedEntityId);
          if (!targetEntity) {
            throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`)
          }

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({schema:property.linkSchema, tableName: property.linkTableName})} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`
            const params = [newEntity.id, relatedEntityId];
            await server.queryDatabaseObject(command, params);
          } else {
            await targetDataAccessor.updateById(targetEntity.id, {[property.selfIdColumnName!]: newEntity.id});
            targetEntity[property.selfIdColumnName!] = newEntity.id;
          }
          newEntity[property.code].push(targetEntity);
        }
      } else {
        // fieldValue is id
        relatedEntityId = relatedEntityToBeSaved
        const targetEntity = await targetDataAccessor.findById(relatedEntityId);
        if (!targetEntity) {
          throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`)
        }

        if (property.linkTableName) {
          const command = `INSERT INTO ${server.queryBuilder.quoteTable({schema:property.linkSchema, tableName: property.linkTableName})} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`
          const params = [newEntity.id, relatedEntityId];
          await server.queryDatabaseObject(command, params);
        } else {
          await targetDataAccessor.updateById(targetEntity.id, {[property.selfIdColumnName!]: newEntity.id});
          targetEntity[property.selfIdColumnName!] = newEntity.id;
        }

        newEntity[property.code].push(targetEntity);
      }
    }
  }


  return newEntity;
}


export async function updateEntityById(
  server: IRpdServer,
  dataAccessor: IRpdDataAccessor,
  options: UpdateEntityByIdOptions,
) {
  const model = dataAccessor.getModel();
  const { id, entity, changes } = options;

  const oneRelationPropertiesToUpdate: RpdDataModelProperty[] = [];
  const manyRelationPropertiesToUpdate: RpdDataModelProperty[] = [];
  _.keys(changes).forEach((propertyCode) => {
    const property = model.properties.find((e) => e.code === propertyCode);
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
  })

  const row = mapEntityToDbRow(model, changes);
  oneRelationPropertiesToUpdate.forEach(property => {
    const fieldValue = changes[property.code];
    if (_.isObject(fieldValue)) {
      row[property.targetIdColumnName!] = fieldValue["id"];
    } else {
      row[property.targetIdColumnName!] = fieldValue;
    }
  })
  let updatedRow = row;
  if (Object.keys(row).length) {
    updatedRow = await dataAccessor.updateById(id, row);
  }
  const updatedEntity = Object.assign({}, entity, updatedRow);

  // save many-relation properties
  for (const property of manyRelationPropertiesToUpdate) {
    const relatedEntities: any[] = [];
    const targetDataAccessor = server.getDataAccessor({
      singularCode: property.targetSingularCode!,
    });

    const relatedEntitiesToBeSaved = changes[property.code];
    if (!_.isArray(relatedEntitiesToBeSaved)) {
      throw new Error(`Value of field '${property.code}' should be an array.`);
    }

    if (property.linkTableName) {
      // TODO: should support removing relation
      await server.queryDatabaseObject(`DELETE FROM ${server.queryBuilder.quoteTable({schema:property.linkSchema, tableName: property.linkTableName})} WHERE ${server.queryBuilder.quoteObject(property.selfIdColumnName!)} = $1`, [id]);
    }

    for (const relatedEntityToBeSaved of relatedEntitiesToBeSaved) {
      let relatedEntityId: any;
      if (_.isObject(relatedEntityToBeSaved)) {
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
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({schema:property.linkSchema, tableName: property.linkTableName})} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`
            const params = [id, newTargetEntity.id];
            await server.queryDatabaseObject(command, params);
          }

          relatedEntities.push(newTargetEntity);
        } else {
          // related entity is existed
          const targetEntity = await targetDataAccessor.findById(relatedEntityId);
          if (!targetEntity) {
            throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`)
          }

          if (property.linkTableName) {
            const command = `INSERT INTO ${server.queryBuilder.quoteTable({schema:property.linkSchema, tableName: property.linkTableName})} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`
            const params = [id, relatedEntityId];
            await server.queryDatabaseObject(command, params);
          } else {
            await targetDataAccessor.updateById(targetEntity.id, {[property.selfIdColumnName!]: id});
            targetEntity[property.selfIdColumnName!] = id;
          }
          relatedEntities.push(targetEntity);
        }
      } else {
        // fieldValue is id
        relatedEntityId = relatedEntityToBeSaved
        const targetEntity = await targetDataAccessor.findById(relatedEntityId);
        if (!targetEntity) {
          throw new Error(`Entity with id '${relatedEntityId}' in field '${property.code}' is not exists.`)
        }

        if (property.linkTableName) {
          const command = `INSERT INTO ${server.queryBuilder.quoteTable({schema:property.linkSchema, tableName: property.linkTableName})} (${server.queryBuilder.quoteObject(property.selfIdColumnName!)}, ${property.targetIdColumnName}) VALUES ($1, $2) ON CONFLICT DO NOTHING;`
          const params = [id, relatedEntityId];
          await server.queryDatabaseObject(command, params);
        } else {
          await targetDataAccessor.updateById(targetEntity.id, {[property.selfIdColumnName!]: id});
          targetEntity[property.selfIdColumnName!] = id;
        }

        relatedEntities.push(targetEntity);
      }
    }
    updatedEntity[property.code] = relatedEntities;
  }

  return updatedEntity;
}