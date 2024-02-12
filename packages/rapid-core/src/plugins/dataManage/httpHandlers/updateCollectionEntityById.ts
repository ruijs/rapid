import { RunEntityHttpHandlerOptions } from "~/types";
import { getEntityPartChanges } from "~/helpers/entityHelpers";
import { mergeInput } from "~/helpers/inputHelper";
import { updateEntityById } from "~/dataAccess/entityManager";
import { mapDbRowToEntity } from "~/dataAccess/entityMapper";
import { HttpHandlerContext } from "~/core/httpHandler";
import { RapidPlugin } from "~/core/server";

export const code = "updateCollectionEntityById";

export async function handler(
  plugin: RapidPlugin,
  ctx: HttpHandlerContext,
  options: RunEntityHttpHandlerOptions,
) {
  const { server, input } = ctx;
  const { defaultInput, fixedInput } = options;

  console.debug(`Running ${code} handler...`);

  console.debug(`defaultInput: ${JSON.stringify(defaultInput)}`);
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  console.debug(`fixedInput: ${JSON.stringify(fixedInput)}`);
  console.debug(`mergedInput: ${JSON.stringify(mergedInput)}`);

  const dataAccessor = server.getDataAccessor(options);
  const id = mergedInput.id;
  const row = await dataAccessor.findById(id);
  if (!row) {
    throw new Error(`${options.namespace}.${options.singularCode}  with id "${id}" was not found.`);
  }

  const entity = mapDbRowToEntity(dataAccessor.getModel(), row);
  const changes = getEntityPartChanges(entity, mergedInput);
  if (!changes) {
    ctx.output = entity;
    return;
  }

  const output = await updateEntityById(server, dataAccessor, { id, entity, changes });
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
