import { IPluginHttpHandler } from "~/core/httpHandler";
import * as createSession from "./createSession";
import * as deleteSession from "./deleteSession";
import * as getMyProfile from "./getMyProfile";

export default [
  createSession,
  deleteSession,
  getMyProfile,
] satisfies IPluginHttpHandler[];