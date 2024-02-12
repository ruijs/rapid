import { RunEntityActionHandlerOptions } from "~/types";
import { findEntity } from "~/dataAccess/entityManager";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "findCollectionEntityById";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
) {
  console.debug(`Running ${code} handler...`);
  const { server, input } = ctx;
  const { id } = input;

  const dataAccessor = server.getDataAccessor(options);
  const user = await findEntity(ctx.server, dataAccessor, {
    filters: [
      {
        operator: "eq",
        field: "id",
        value: id,
      }
    ],
  });
  if (!user) {
    throw new Error(`${options.namespace}.${options.singularCode} with id "${id}" was not found.`);
  }
  ctx.output = user;
}
