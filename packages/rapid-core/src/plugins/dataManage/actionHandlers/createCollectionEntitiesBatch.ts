import { IDatabaseClient, RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { isArray } from "lodash";
import { ActionHandlerContext } from "~/core/actionHandler";
import { IRpdServer, RapidPlugin } from "~/core/server";
import { RouteContext } from "~/core/routeContext";
import EntityManager from "~/dataAccess/entityManager";

export const code = "createCollectionEntitiesBatch";

interface createCollectionEntitiesBatchInput {
  entities: any[];
  noTransaction?: boolean;
}

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input, routerContext: routeContext } = ctx;

  const { defaultInput, fixedInput } = options;
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, input });

  const { entities, noTransaction } = input;
  if (!isArray(entities)) {
    throw new Error("input.entities should be an array.");
  }

  let output: any[] = [];
  const entityManager = server.getEntityManager(options.singularCode);

  if (noTransaction) {
    output = await createEntities({
      routeContext,
      plugin,
      entityManager,
      entities,
      defaultInput,
      fixedInput,
    });
    ctx.output = output;
  } else {
    let transactionDbClient: IDatabaseClient;

    try {
      transactionDbClient = await routeContext.beginDbTransaction();

      output = await createEntities({
        routeContext,
        plugin,
        entityManager,
        entities,
        defaultInput,
        fixedInput,
      });
      ctx.output = output;

      await routeContext.commitDbTransaction();
    } catch (ex) {
      await routeContext.rollbackDbTransaction();
      throw ex;
    } finally {
      if (transactionDbClient) {
        transactionDbClient.release();
      }
    }
  }
}

interface CreateEntitiesOptions {
  routeContext: RouteContext;
  plugin: RapidPlugin;
  entityManager: EntityManager;
  entities: any[];
  defaultInput: any;
  fixedInput: any;
}

async function createEntities(options: CreateEntitiesOptions) {
  const { routeContext, plugin, entityManager, entities, defaultInput, fixedInput } = options;
  const result: any[] = [];
  for (const entity of entities) {
    const mergedEntity = mergeInput(defaultInput?.entity || {}, entity, fixedInput?.entity);

    const userId = routeContext.state?.userId;
    if (userId) {
      mergedEntity.createdBy = userId;
    }

    const newEntity = await entityManager.createEntity(
      {
        entity: mergedEntity,
        routeContext: routeContext,
      },
      plugin,
    );

    result.push(newEntity);
  }

  return result;
}
