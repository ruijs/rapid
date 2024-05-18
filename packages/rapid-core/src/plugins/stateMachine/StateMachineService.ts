import { IRpdServer } from "~/core/server";
import { DefaultStateMachineSnapshot, GetStateMachineNextSnapshotOptions, TryGetStateMachineNextSnapshotResult } from "./StateMachinePluginTypes";
import { createMachine, getInitialSnapshot, getNextSnapshot } from "xstate";

export async function getStateMachineNextSnapshot(server: IRpdServer, options: GetStateMachineNextSnapshotOptions) {
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

export async function tryGetStateMachineNextSnapshot(server: IRpdServer, options: GetStateMachineNextSnapshotOptions): Promise<TryGetStateMachineNextSnapshotResult> {
  const { machineConfig, currentState, event } = options;
  machineConfig.initial = currentState;

  const machine = createMachine(machineConfig);
  const snapshot = getInitialSnapshot(machine);

  const canTransfer = snapshot.can(event);
  let nextSnapshot: DefaultStateMachineSnapshot;
  if (canTransfer) {
    nextSnapshot = getNextSnapshot(machine, snapshot, event);
  }

  return {
    canTransfer,
    nextSnapshot,
  };
}
