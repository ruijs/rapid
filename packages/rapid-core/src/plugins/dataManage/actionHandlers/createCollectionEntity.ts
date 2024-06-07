import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "createCollectionEntity";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input } = ctx;

  const { defaultInput, fixedInput } = options;
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const userId = ctx.routerContext.state?.userId;
  if (userId) {
    input.createdBy = userId;
  }

  const entityManager = server.getEntityManager(options.singularCode);
  const output = await entityManager.createEntity(
    {
      entity: input,
    },
    plugin,
  );
  ctx.output = output;
}
