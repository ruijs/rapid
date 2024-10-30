import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { isArray } from "lodash";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { RouteContext } from "~/core/routeContext";
import EntityManager from "~/dataAccess/entityManager";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";

export const code = "createCollectionEntitiesBatch";

interface createCollectionEntitiesBatchInput {
  entities: any[];
  noTransaction?: boolean;
}

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { input } = ctx;
  const { noTransaction } = input;
  const { defaultInput, fixedInput } = options;
  await runCollectionEntityActionHandler(
    ctx,
    options,
    code,
    false,
    !noTransaction,
    async (entityManager, input: createCollectionEntitiesBatchInput): Promise<any> => {
      const { routerContext: routeContext } = ctx;

      const { entities } = input;
      if (!isArray(entities)) {
        throw new Error("input.entities should be an array.");
      }

      let output: any[] = [];
      output = await createEntities({
        routeContext,
        plugin,
        entityManager,
        entities,
        defaultInput,
        fixedInput,
      });
      return output;
    },
  );
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
