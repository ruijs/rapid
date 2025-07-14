import { IPluginActionHandler } from "~/core/actionHandler";
import * as getLicense from "./getLicense";
import * as updateLicense from "./updateLicense";

export default [getLicense, updateLicense] satisfies IPluginActionHandler[];
