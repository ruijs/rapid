import { RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "./inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import EntityManager from "~/dataAccess/entityManager";

type EntityActionHandler = (entityManager: EntityManager, input: any) => Promise<any>;

export default async function runCollectionEntityActionHandler(ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions, code: string, handleEntityAction: EntityActionHandler) {
  const { logger, server, input } = ctx;

  const { defaultInput, fixedInput } = options;
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const entityManager = server.getEntityManager(options.singularCode);
  const result = handleEntityAction(entityManager, mergedInput);
  if (result instanceof Promise) {
    ctx.output = await result;
  } else {
    ctx.output = result;
  }
}
