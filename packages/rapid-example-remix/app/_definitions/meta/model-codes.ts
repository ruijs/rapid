export const entitySingularCodes = [
  'oc_department',
  'oc_role',
  'oc_user',
  'pm_bug_issue',
  'pm_task',
  'sys_action',
  'sys_action_group',
] as const;
export type TEntitySingularCodes = typeof entitySingularCodes[number];

const entityFieldCodes = {
  'OcDepartment': [
    'id',
    'parent',
    'code',
    'name',
    'orderNum',
    'users',
  ],
  'OcRole': [
    'id',
    'name',
    'description',
    'orderNum',
    'state',
    'users',
    'actions',
  ],
  'OcUser': [
    'id',
    'name',
    'login',
    'password',
    'hidden',
    'state',
    'email',
    'department',
    'roles',
  ],
  'PmBugIssue': [
    'id',
    'bugLevel',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'deletedAt',
    'deletedBy',
  ],
  'PmTask': [
    'id',
    'code',
    'title',
    'description',
    'taskType',
    'state',
  ],
  'SysAction': [
    'id',
    'group',
    'code',
    'name',
    'description',
    'orderNum',
  ],
  'SysActionGroup': [
    'id',
    'code',
    'name',
    'orderNum',
  ],
} as const;
export type TEntityFieldCodes = typeof entityFieldCodes;
export type TEntityCodes = keyof TEntityFieldCodes;
