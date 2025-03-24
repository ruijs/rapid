import { EntityWatcher } from "~/types";
import cronJobEntityWatchers from "./cronJobEntityWatchers";

export default [...cronJobEntityWatchers] satisfies EntityWatcher<any>[];
