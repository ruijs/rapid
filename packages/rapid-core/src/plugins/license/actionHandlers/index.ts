import { IPluginActionHandler } from "~/core/actionHandler";
import * as getLicense from "./getLicense";

export default [getLicense] satisfies IPluginActionHandler[];
