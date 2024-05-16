import { IPluginActionHandler } from "~/core/actionHandler";
import * as runCronJob from "./runCronJob";

export default [
  runCronJob,
] satisfies IPluginActionHandler[];