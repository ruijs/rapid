import { RunEntityActionHandlerOptions } from "~/types";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "deleteCollectionEntityById";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: RunEntityActionHandlerOptions) {
  const { logger, server, input } = ctx;
  logger.debug(`Running ${code} handler...`);

  const entityManager = server.getEntityManager(options.singularCode);
  await entityManager.deleteById(input.id, plugin);

  ctx.status = 200;
  ctx.output = {};
}
