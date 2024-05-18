import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "updateCollectionEntityById";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
) {
  const { logger, server, input } = ctx;

  const { defaultInput, fixedInput } = options;
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const operation = mergedInput.$operation;
  if (operation) {
    delete mergedInput.$operation;
  }

  const stateProperties = mergedInput.$stateProperties;
  if (stateProperties) {
    delete mergedInput.$stateProperties;
  }

  const entityManager = server.getEntityManager(options.singularCode);
  const output = await entityManager.updateEntityById({ id: mergedInput.id, entityToSave: mergedInput, operation, stateProperties }, plugin);
  ctx.output = output;
}
