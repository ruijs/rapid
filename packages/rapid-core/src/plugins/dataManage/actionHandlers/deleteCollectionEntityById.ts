import { RunEntityActionHandlerOptions } from "~/types";
import { mapDbRowToEntity } from "~/dataAccess/entityMapper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "deleteCollectionEntityById";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
) {
  console.debug(`Running ${code} handler...`);
  const { server, input } = ctx;

  const entityManager = server.getEntityManager(options.singularCode);
  await entityManager.deleteById(input.id, plugin);

  ctx.status = 200;
}
