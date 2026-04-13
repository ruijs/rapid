import { RunEntityActionHandlerOptions, UpdateEntityByIdOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";

export const code = "updateCollectionEntityById";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  await runCollectionEntityActionHandler(ctx, options, code, true, true, async (entityManager, input: any): Promise<any> => {
    const { routerContext: routeContext } = ctx;

    const operation = input.$operation;
    if (operation) {
      delete input.$operation;
    }

    const stateProperties = input.$stateProperties;
    if (stateProperties) {
      delete input.$stateProperties;
    }

    const relationPropertiesToUpdate = input.$relationPropertiesToUpdate;
    if (relationPropertiesToUpdate) {
      delete input.$relationPropertiesToUpdate;
    }

    const updateEntityByIdOptions: UpdateEntityByIdOptions = {
      id: input.id,
      entityToSave: input,
      operation,
      stateProperties,
      relationPropertiesToUpdate,
      routeContext,
    };
    const output = await entityManager.updateEntityById(updateEntityByIdOptions, plugin);
    return output;
  });
}
