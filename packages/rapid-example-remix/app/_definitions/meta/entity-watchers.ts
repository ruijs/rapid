import type { EntityWatcherType as TEntityWatcherType } from '@ruiapp/rapid-core';
import ocUserEntityWatchers from '../models/entity-watchers/ocUserEntityWatchers';

export default [
  ...ocUserEntityWatchers,
] as TEntityWatcherType[];
