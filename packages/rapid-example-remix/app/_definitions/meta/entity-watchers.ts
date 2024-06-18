import type { EntityWatcherType as TEntityWatcherType } from '@ruiapp/rapid-core';
import ocUserEntityWatchers from '../models/entity-watchers/ocUserEntityWatchers';
import pmTaskEntityWatchers from '../models/entity-watchers/pmTaskEntityWatchers';

export default [
  ...ocUserEntityWatchers,
  ...pmTaskEntityWatchers,
] as TEntityWatcherType[];
