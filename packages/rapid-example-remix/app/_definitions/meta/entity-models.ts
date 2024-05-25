import type { RapidEntity as TRapidEntity } from '@ruiapp/rapid-extension';
import { autoConfigureRapidEntity } from '@ruiapp/rapid-extension';
import OcDepartment from '../models/entities/OcDepartment';
import OcRole from '../models/entities/OcRole';
import OcUser from '../models/entities/OcUser';
import PmTask from '../models/entities/PmTask';
import SysAction from '../models/entities/SysAction';
import SysActionGroup from '../models/entities/SysActionGroup';

export default [
  autoConfigureRapidEntity(OcDepartment),
  autoConfigureRapidEntity(OcRole),
  autoConfigureRapidEntity(OcUser),
  autoConfigureRapidEntity(PmTask),
  autoConfigureRapidEntity(SysAction),
  autoConfigureRapidEntity(SysActionGroup),
] as TRapidEntity[];
