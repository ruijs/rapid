import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "runServerOperation";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: {
    operation: (ctx: ActionHandlerContext) => Promise<void>;
  },
) {
  const { operation } = options;
  await operation(ctx);
}
