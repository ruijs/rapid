import { IPluginInstance, RunEntityHttpHandlerOptions } from "~/types";
import { mapDbRowToEntity } from "~/dataAccess/entityMapper";
import { HttpHandlerContext } from "~/core/httpHandler";

export const code = "deleteCollectionEntityById";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: RunEntityHttpHandlerOptions,
) {
  console.debug(`Running ${code} handler...`);
  const { server, input } = ctx;

  const dataAccessor = server.getDataAccessor(options);
  const id = input.id;
  const row = await dataAccessor.findById(id);
  if (!row) {
    ctx.routerContext.status = 200;
    return;
  }

  await dataAccessor.deleteById(id);

  const entity = mapDbRowToEntity(dataAccessor.getModel(), row);

  server.emitEvent(
    "entity.delete",
    plugin,
    {
      namespace: options.namespace,
      modelSingularCode: options.singularCode,
      before: entity,
    },
  );

  ctx.routerContext.status = 200;
}
