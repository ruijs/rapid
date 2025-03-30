import type { ServerOperation as TServerOperation } from '@ruiapp/rapid-core';
import listMyAllowedSysActions from '../models/server-operations/listMyAllowedSysActions';
import unitTest from '../models/server-operations/unitTest';

export default [
  listMyAllowedSysActions,
  unitTest,
] as TServerOperation[];
