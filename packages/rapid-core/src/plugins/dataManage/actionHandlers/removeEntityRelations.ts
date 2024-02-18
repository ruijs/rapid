import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "removeEntityRelations";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
) {
  const { logger, server, input } = ctx;
  const { defaultInput, fixedInput } = options;

  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const entityManager = server.getEntityManager(options.singularCode);
  await entityManager.removeRelations(mergedInput, plugin);

  ctx.output = {};
}
