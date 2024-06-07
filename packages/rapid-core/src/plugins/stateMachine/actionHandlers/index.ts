import { IPluginActionHandler } from "~/core/actionHandler";
import * as sendStateMachineEvent from "./sendStateMachineEvent";

export default [sendStateMachineEvent] satisfies IPluginActionHandler[];
