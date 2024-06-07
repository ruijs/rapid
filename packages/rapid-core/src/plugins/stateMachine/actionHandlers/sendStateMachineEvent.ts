import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { SendStateMachineEventInput, SendStateMachineEventOptions } from "../StateMachinePluginTypes";
import { getStateMachineNextSnapshot } from "../stateMachineHelper";

export const code = "sendStateMachineEvent";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: SendStateMachineEventOptions) {
  const { server, routerContext } = ctx;
  const { response } = routerContext;

  const input: SendStateMachineEventInput = ctx.input;
  if (options?.code) {
    input.code = options.code;
  }

  if (!input.code) {
    throw new Error(`State machine code is required when sending event.`);
  }

  const stateMachineDataAccessor = server.getDataAccessor({
    singularCode: "state_machine",
  });

  const stateMachine = await stateMachineDataAccessor.findOne({
    filters: [
      {
        operator: "eq",
        field: "code",
        value: input.code,
      },
    ],
  });

  if (!stateMachine) {
    throw new Error(`State machine with code '${input.code}' was not found.`);
  }

  stateMachine.config.id = input.code;

  const snapshot = await getStateMachineNextSnapshot({
    machineConfig: stateMachine.config,
    context: input.context,
    currentState: input.currentState,
    event: input.event,
  });

  response.json({
    state: snapshot.value,
  });
}
