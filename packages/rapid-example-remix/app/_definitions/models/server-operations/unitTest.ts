import type { ActionHandlerContext, ServerOperation } from "@ruiapp/rapid-core";

export default {
  code: "unitTest",

  method: "GET",

  async handler(ctx: ActionHandlerContext) {
    const { server } = ctx;

    ctx.output = {
      result: "ok",
    };
  },
} satisfies ServerOperation;
