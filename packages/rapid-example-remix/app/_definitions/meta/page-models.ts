import type { RapidPageLoader as TRapidPageLoader } from '@ruiapp/rapid-extension';
import BaseShiftListPage from '../models/pages/BaseShiftListPage';
import I18nTestPage from '../models/pages/I18nTestPage';
import OcDepartmentListPage from '../models/pages/OcDepartmentListPage';
import OcRoleDetailsPage from '../models/pages/OcRoleDetailsPage';
import OcRoleListPage from '../models/pages/OcRoleListPage';
import OcUserDetailsPage from '../models/pages/OcUserDetailsPage';
import OcUserListPage from '../models/pages/OcUserListPage';
import PmBugIssueListPage from '../models/pages/PmBugIssueListPage';
import PmLogListPage from '../models/pages/PmLogListPage';
import PmProjectDetailsPage from '../models/pages/PmProjectDetailsPage';
import PmProjectListPage from '../models/pages/PmProjectListPage';
import PmTaskListPage from '../models/pages/PmTaskListPage';
import sys$SysActionListPage from '../models/pages/sys/SysActionListPage';
import sys$SysCronJobListPage from '../models/pages/sys/SysCronJobListPage';

export default [
  BaseShiftListPage,
  I18nTestPage,
  OcDepartmentListPage,
  OcRoleDetailsPage,
  OcRoleListPage,
  OcUserDetailsPage,
  OcUserListPage,
  PmBugIssueListPage,
  PmLogListPage,
  PmProjectDetailsPage,
  PmProjectListPage,
  PmTaskListPage,
  sys$SysActionListPage,
  sys$SysCronJobListPage,
] as TRapidPageLoader[];
