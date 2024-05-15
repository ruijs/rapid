import { MachineConfig } from "xstate";


export type PropertyStateMachineConfig = {
  enabled: boolean;
  config: MachineConfig<any, any>;
  transferControl?: boolean;
}

export type SendStateMachineEventOptions = {
  code: string;
}

export type SendStateMachineEventInput = {
  code?: string;
  context: any;
  currentState: string;
  event: StateMachineEvent;
}

export type StateMachineEvent = {
  type: string;
}

export type GetStateMachineNextSnapshotOptions = {
  machineConfig: MachineConfig<any, any>;
  context: any;
  currentState: string;
  event: StateMachineEvent;
}