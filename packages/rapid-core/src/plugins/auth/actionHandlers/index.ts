import { IPluginActionHandler } from "~/core/actionHandler";
import * as createSession from "./createSession";
import * as deleteSession from "./deleteSession";
import * as getMyProfile from "./getMyProfile";

export default [
  createSession,
  deleteSession,
  getMyProfile,
] satisfies IPluginActionHandler[];