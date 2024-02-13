import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { isArray } from "lodash";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "createCollectionEntitiesBatch";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
) {
  const { server, input } = ctx;
  const { defaultInput, fixedInput } = options;

  console.debug(`Running ${code} handler...`);

  const { entities } = input;
  if (!isArray(entities)) {
    throw new Error("input.entities should be an array.");
  }

  console.debug(`defaultInput: ${JSON.stringify(defaultInput)}`);
  console.debug(`fixedInput: ${JSON.stringify(fixedInput)}`);

  const output: any[] = [];
  for(const entity of entities) {
    const mergedEntity = mergeInput(defaultInput?.entity || {}, entity, fixedInput?.entity);
    console.debug(`mergedEntity: ${JSON.stringify(mergedEntity)}`);

    const userId = ctx.routerContext.state?.userId;
    if (userId) {
      mergedEntity.createdBy = userId;
    }

    const entityManager = server.getEntityManager(options.singularCode);
    const newEntity = await entityManager.createEntity({
      entity: mergedEntity,
    });

    server.emitEvent(
      "entity.create",
      plugin,
      {
        namespace: options.namespace,
        modelSingularCode: options.singularCode,
        after: newEntity,
      },
    );

    output.push(newEntity);
  }

  ctx.output = output;

}
