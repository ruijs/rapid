import type { RapidPage as TRapidPage } from '@ruiapp/rapid-extension';
import BaseShiftListPage from '../models/pages/BaseShiftListPage';
import OcDepartmentListPage from '../models/pages/OcDepartmentListPage';
import OcRoleDetailsPage from '../models/pages/OcRoleDetailsPage';
import OcRoleListPage from '../models/pages/OcRoleListPage';
import OcUserListPage from '../models/pages/OcUserListPage';
import PmBugIssueListPage from '../models/pages/PmBugIssueListPage';
import PmProjectListPage from '../models/pages/PmProjectListPage';
import PmTaskListPage from '../models/pages/PmTaskListPage';

export default [
  BaseShiftListPage,
  OcDepartmentListPage,
  OcRoleDetailsPage,
  OcRoleListPage,
  OcUserListPage,
  PmBugIssueListPage,
  PmProjectListPage,
  PmTaskListPage,
] as TRapidPage[];
