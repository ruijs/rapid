import * as _ from "lodash";
import { RunQueryDatabaseHandlerOptions } from "~/types";
import { mergeInput } from "~/helpers/inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "queryDatabase";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: RunQueryDatabaseHandlerOptions,
) {
  const { server, input } = ctx;
  const { sql, querySingle, defaultInput, fixedInput } = options;

  console.debug(`Running ${code} handler...`);

  console.debug(`defaultInput: ${JSON.stringify(defaultInput)}`);
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  console.debug(`fixedInput: ${JSON.stringify(fixedInput)}`);
  console.debug(`mergedInput: ${JSON.stringify(mergedInput)}`);

  const result = await server.queryDatabaseObject(sql, mergedInput);
  if (querySingle) {
    ctx.output = _.first(result);
  } else {
    ctx.output = result;
  }
}
