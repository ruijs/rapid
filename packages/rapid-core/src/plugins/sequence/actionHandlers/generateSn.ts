import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { GenerateSequenceNumbersInput, GenerateSequenceNumbersOutput, generateSn } from "../SequenceService";

export interface GenerateSequenceNumbersOptions {
  ruleCode: string;
}


export const code = "generateSn";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: GenerateSequenceNumbersOptions,
) {
  const { server, routerContext } = ctx;
  const { response } = routerContext;
  
  const input: GenerateSequenceNumbersInput = ctx.input;

  if (options?.ruleCode) {
    input.ruleCode = options.ruleCode;
  }

  if (!input.ruleCode) {
    throw new Error(`Rule code is required when generating sequence numbers.`);
  }

  const sequences = await generateSn(server, input);

  ctx.output = {
    sequences,
  } satisfies GenerateSequenceNumbersOutput;
}
