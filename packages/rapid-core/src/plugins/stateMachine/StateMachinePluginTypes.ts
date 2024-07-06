import { AnyActorRef, AnyEventObject, EventObject, MachineConfig, MachineContext, MachineSnapshot, MetaObject, StateValue } from "xstate";

export type PropertyStateMachineConfig = {
  enabled: boolean;
  config: MachineConfig<any, any>;
  transferControl?: boolean;
};

export type SendStateMachineEventOptions = {
  code: string;
};

export type StateMachineEvent = AnyEventObject;

export type SendStateMachineEventInput = {
  code?: string;
  context: any;
  currentState: string;
  event: StateMachineEvent;
};

export type GetStateMachineNextSnapshotOptions = {
  machineConfig: MachineConfig<any, any>;
  context: any;
  currentState: string;
  event: StateMachineEvent;
};

export type DefaultStateMachineSnapshot = MachineSnapshot<
  MachineContext,
  EventObject,
  Record<string, AnyActorRef | undefined>,
  StateValue,
  string,
  unknown,
  MetaObject
>;

export type TryGetStateMachineNextSnapshotResult = TryGetStateMachineNextSnapshotPositiveResult | TryGetStateMachineNextSnapshotNegativeResult;

export type TryGetStateMachineNextSnapshotPositiveResult = {
  canTransfer: true;
  nextSnapshot: DefaultStateMachineSnapshot;
};

export type TryGetStateMachineNextSnapshotNegativeResult = {
  canTransfer: false;
};
