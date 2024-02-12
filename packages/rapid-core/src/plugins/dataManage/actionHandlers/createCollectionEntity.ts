import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { createEntity } from "~/dataAccess/entityManager";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "createCollectionEntity";

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

  const userId = ctx.routerContext.state?.userId;
  if (userId) {
    input.createdBy = userId;
  }

  const dataAccessor = server.getDataAccessor(options);
  const output = await createEntity(server, dataAccessor, {
    entity: input,
  });
  ctx.output = output;

  server.emitEvent(
    "entity.create",
    plugin,
    {
      namespace: options.namespace,
      modelSingularCode: options.singularCode,
      after: output,
    },
  );
}
