export const entitySingularCodes = [
  'oc_department',
  'oc_role',
  'oc_user',
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
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'deletedAt',
    'detetedBy',
  ],
  'OcRole': [
    'id',
    'name',
    'description',
    'orderNum',
    'state',
    'users',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'deletedAt',
    'detetedBy',
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
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'deletedAt',
    'detetedBy',
  ],
} as const;
export type TEntityFieldCodes = typeof entityFieldCodes;
export type TEntityCodes = keyof TEntityFieldCodes;
