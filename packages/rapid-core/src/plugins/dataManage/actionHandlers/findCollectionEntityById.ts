import { RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "findCollectionEntityById";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input } = ctx;
  logger.debug(`Running ${code} handler...`, { input });
  const { id } = input;

  const entityManager = server.getEntityManager(options.singularCode);
  const entity = await entityManager.findById(id);
  if (!entity) {
    throw new Error(`${options.namespace}.${options.singularCode} with id "${id}" was not found.`);
  }
  ctx.output = entity;
}
