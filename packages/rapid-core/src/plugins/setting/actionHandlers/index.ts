import { IPluginActionHandler } from "~/core/actionHandler";
import * as getUserSettingValues from "./getUserSettingValues";
import * as getSystemSettingValues from "./getSystemSettingValues";

export default [getUserSettingValues, getSystemSettingValues] satisfies IPluginActionHandler[];
