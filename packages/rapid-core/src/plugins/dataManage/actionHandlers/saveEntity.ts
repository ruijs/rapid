import { RunEntityActionHandlerOptions, UpdateEntityByIdOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import runCollectionEntityActionHandler from "~/helpers/runCollectionEntityActionHandler";
import { interpreteConfigExpressions } from "~/core/ExpressionInterpreter";

export const code = "saveEntity";

export type SaveEntityActionHandlerOptions = {
  singularCode: string;
  entity?: Record<string, any>;
};

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: SaveEntityActionHandlerOptions) {
  const { server, routerContext: routeContext, vars } = ctx;

  interpreteConfigExpressions(options, vars || {});

  const input = options.entity;

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

  const entityManager = server.getEntityManager(options.singularCode);
  const updateEntityByIdOptions: UpdateEntityByIdOptions = {
    id: input.id,
    entityToSave: input,
    operation,
    stateProperties,
    relationPropertiesToUpdate,
    routeContext,
  };
  ctx.output = await entityManager.updateEntityById(updateEntityByIdOptions, plugin);
}
