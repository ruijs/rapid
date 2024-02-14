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

  const output = await entityManager.updateEntityById({ id: mergedInput.id, entityToSave: mergedInput }, plugin);
  ctx.output = output;
}
