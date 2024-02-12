import * as _ from "lodash";
import { IRpdDataAccessor, RunEntityActionHandlerOptions } from "~/types";
import { mergeInput } from "./inputHelper";
import { ActionHandlerContext } from "~/core/actionHandler";

type DataAccessHandler = (
  dataAccessor: IRpdDataAccessor,
  input: any,
) => Promise<any>;

export default async function runCollectionEntityActionHandler(
  ctx: ActionHandlerContext,
  options: RunEntityActionHandlerOptions,
  code: string,
  handleDataAccess: DataAccessHandler,
) {
  const { server, input } = ctx;
  const { defaultInput, fixedInput } = options;

  console.debug(`Running ${code} handler...`);

  console.debug(`defaultInput: ${JSON.stringify(defaultInput)}`);
  const mergedInput = mergeInput(defaultInput, input, fixedInput);
  console.debug(`fixedInput: ${JSON.stringify(fixedInput)}`);
  console.debug(`mergedInput: ${JSON.stringify(mergedInput)}`);

  const dataAccessor = server.getDataAccessor(options);
  const result = handleDataAccess(dataAccessor, mergedInput);
  if (result instanceof Promise) {
    ctx.output = await result;
  } else {
    ctx.output = result;
  }
}
