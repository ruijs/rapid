import type { RapidEntity as TRapidEntity } from '@ruiapp/rapid-extension';
import { autoConfigureRapidEntity } from '@ruiapp/rapid-extension';
import oc$OcDepartment from '../models/entities/oc/OcDepartment';
import oc$OcRole from '../models/entities/oc/OcRole';
import oc$OcUser from '../models/entities/oc/OcUser';
import pm$PmBugIssue from '../models/entities/pm/PmBugIssue';
import pm$PmTask from '../models/entities/pm/PmTask';
import sys$SysAction from '../models/entities/sys/SysAction';
import sys$SysActionGroup from '../models/entities/sys/SysActionGroup';

const entityDefinitions = [
  oc$OcDepartment,
  oc$OcRole,
  oc$OcUser,
  pm$PmBugIssue,
  pm$PmTask,
  sys$SysAction,
  sys$SysActionGroup,
];
const configuredEntities:TRapidEntity[] = [
  autoConfigureRapidEntity(oc$OcDepartment, entityDefinitions),
  autoConfigureRapidEntity(oc$OcRole, entityDefinitions),
  autoConfigureRapidEntity(oc$OcUser, entityDefinitions),
  autoConfigureRapidEntity(pm$PmBugIssue, entityDefinitions),
  autoConfigureRapidEntity(pm$PmTask, entityDefinitions),
  autoConfigureRapidEntity(sys$SysAction, entityDefinitions),
  autoConfigureRapidEntity(sys$SysActionGroup, entityDefinitions),
];
export default configuredEntities;
