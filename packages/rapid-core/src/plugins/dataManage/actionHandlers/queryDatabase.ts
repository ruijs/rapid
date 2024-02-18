import { RunQueryDatabaseHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { first } from "lodash";

export const code = "queryDatabase";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunQueryDatabaseHandlerOptions,
) {
  const { logger, server, input } = ctx;

  const { sql, querySingle, defaultInput, fixedInput } = options;
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  logger.debug(`Running ${code} handler...`, { defaultInput, fixedInput, mergedInput });

  const result = await server.queryDatabaseObject(sql, mergedInput);
  if (querySingle) {
    ctx.output = first(result);
  } else {
    ctx.output = result;
  }
}
