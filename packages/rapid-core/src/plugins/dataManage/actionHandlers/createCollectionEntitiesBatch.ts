import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { isArray } from "lodash";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "createCollectionEntitiesBatch";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input } = ctx;

  const { defaultInput, fixedInput } = options;
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, input });

  const { entities } = input;
  if (!isArray(entities)) {
    throw new Error("input.entities should be an array.");
  }

  const output: any[] = [];
  for (const entity of entities) {
    const mergedEntity = mergeInput(defaultInput?.entity || {}, entity, fixedInput?.entity);

    const userId = ctx.routerContext.state?.userId;
    if (userId) {
      mergedEntity.createdBy = userId;
    }

    const entityManager = server.getEntityManager(options.singularCode);
    const newEntity = await entityManager.createEntity(
      {
        entity: mergedEntity,
      },
      plugin,
    );

    output.push(newEntity);
  }

  ctx.output = output;
}
