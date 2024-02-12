import { RunEntityHttpHandlerOptions } from "~/types";
import { findEntity } from "~/dataAccess/entityManager";
import { HttpHandlerContext } from "~/core/httpHandler";
import { RapidPlugin } from "~/core/server";

export const code = "findCollectionEntityById";

export async function handler(
  plugin: RapidPlugin,
  ctx: HttpHandlerContext,
  options: RunEntityHttpHandlerOptions,
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
