import { IPluginActionHandler } from "~/core/actionHandler";
import * as changePassword from "./changePassword";
import * as createSession from "./createSession";
import * as deleteSession from "./deleteSession";
import * as getMyProfile from "./getMyProfile";
import * as resetPassword from "./resetPassword";

export default [changePassword, createSession, deleteSession, getMyProfile, resetPassword] satisfies IPluginActionHandler[];
