import { IPluginActionHandler } from "~/core/actionHandler";
import * as getUserSettingValues from "./getUserSettingValues";
import * as getSystemSettingValues from "./getSystemSettingValues";
import * as setSystemSettingValues from "./setSystemSettingValues";

export default [getUserSettingValues, getSystemSettingValues, setSystemSettingValues] satisfies IPluginActionHandler[];
