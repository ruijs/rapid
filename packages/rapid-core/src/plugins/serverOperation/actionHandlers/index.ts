import { IPluginActionHandler } from "~/core/actionHandler";
import * as runServerOperation from "./runServerOperation";

export default [
  runServerOperation,
] satisfies IPluginActionHandler[];