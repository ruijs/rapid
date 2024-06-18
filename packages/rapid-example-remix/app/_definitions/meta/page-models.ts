import type { RapidPage as TRapidPage } from '@ruiapp/rapid-extension';
import OcDepartmentListPage from '../models/pages/OcDepartmentListPage';
import OcRoleDetailsPage from '../models/pages/OcRoleDetailsPage';
import OcRoleListPage from '../models/pages/OcRoleListPage';
import OcUserListPage from '../models/pages/OcUserListPage';
import PmBugIssueListPage from '../models/pages/PmBugIssueListPage';
import PmTaskListPage from '../models/pages/PmTaskListPage';

export default [
  OcDepartmentListPage,
  OcRoleDetailsPage,
  OcRoleListPage,
  OcUserListPage,
  PmBugIssueListPage,
  PmTaskListPage,
] as TRapidPage[];
