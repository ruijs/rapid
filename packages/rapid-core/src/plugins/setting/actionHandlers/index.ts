import { IPluginActionHandler } from "~/core/actionHandler";
import * as getSystemSettingValues from "./getSystemSettingValues";

export default [getSystemSettingValues] satisfies IPluginActionHandler[];
