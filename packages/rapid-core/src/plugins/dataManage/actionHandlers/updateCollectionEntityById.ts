import { RunEntityActionHandlerOptions } from "~/types";
import { getEntityPartChanges } from "~/helpers/entityHelpers";
import { mergeInput } from "~/helpers/inputHelper";
import { mapDbRowToEntity } from "~/dataAccess/entityMapper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "updateCollectionEntityById";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
) {
  const { server, input } = ctx;
  const { defaultInput, fixedInput } = options;

  console.debug(`Running ${code} handler...`);

  console.debug(`defaultInput: ${JSON.stringify(defaultInput)}`);
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  console.debug(`fixedInput: ${JSON.stringify(fixedInput)}`);
  console.debug(`mergedInput: ${JSON.stringify(mergedInput)}`);

  const entityManager = server.getEntityManager(options.singularCode);
  const id = mergedInput.id;
  const row = await entityManager.findById(id);
  if (!row) {
    throw new Error(`${options.namespace}.${options.singularCode}  with id "${id}" was not found.`);
  }

  const entity = mapDbRowToEntity(entityManager.getModel(), row);
  const changes = getEntityPartChanges(entity, mergedInput);
  if (!changes) {
    ctx.output = entity;
    return;
  }

  const output = await entityManager.updateEntityById({ id, entity, changes });
  ctx.output = output;

  server.emitEvent(
    "entity.update",
    plugin,
    {
      namespace: options.namespace,
      modelSingularCode: options.singularCode,
      before: entity,
      after: output,
      changes: changes,
    },
  );
}
