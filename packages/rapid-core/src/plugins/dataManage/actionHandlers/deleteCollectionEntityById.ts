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
  const id = input.id;
  const row = await entityManager.findById(id);
  if (!row) {
    ctx.status = 200;
    return;
  }

  await entityManager.deleteById(id);

  const entity = mapDbRowToEntity(entityManager.getModel(), row);

  server.emitEvent(
    "entity.delete",
    plugin,
    {
      namespace: options.namespace,
      modelSingularCode: options.singularCode,
      before: entity,
    },
  );

  ctx.status = 200;
}
