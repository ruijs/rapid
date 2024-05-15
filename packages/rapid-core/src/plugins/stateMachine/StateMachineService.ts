import { IRpdServer } from "~/core/server";
import { GetStateMachineNextSnapshotOptions } from "./StateMachinePluginTypes";
import { createMachine, getInitialSnapshot, getNextSnapshot } from "xstate";

export async function getStateMachineNextSnapshot(server: IRpdServer, options: GetStateMachineNextSnapshotOptions) {
  debugger
  const { machineConfig, currentState, event } = options;
  machineConfig.initial = currentState;

  const machine = createMachine(machineConfig);
  const snapshot = getInitialSnapshot(machine);

  if (!snapshot.can(event)) {
    throw new Error(`'${event.type}' action is not allowed at '${currentState}' state.`);
  }

  const nextSnapshot = getNextSnapshot(machine, snapshot, event);
  return nextSnapshot;
}