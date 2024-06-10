import type { TDictionaryCodes } from '../../../meta/data-dictionary-codes';
import type { TEntitySingularCodes } from '../../../meta/model-codes';
import type { RapidEntity } from '@ruiapp/rapid-extension';

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: 'app',
  code: 'OcRole',
  name: '角色',
  fields: [
    {
      code: 'name',
      name: '名称',
      type: 'text',
      required: true,
    },
    {
      code: 'description',
      name: '描述',
      type: 'text',
    },
    {
      code: 'orderNum',
      name: '排序',
      type: 'integer',
      required: true,
    },
    {
      code: 'state',
      name: '状态',
      required: true,
      type: 'option',
      dataDictionary: 'EnabledDisabledState',
    },
    {
      code: 'users',
      name: '用户',
      type: 'relation[]',
      targetSingularCode: 'oc_user',
      linkTableName: 'oc_role_user_links',
      targetIdColumnName: 'user_id',
      selfIdColumnName: 'role_id',
    },
    {
      code: 'actions',
      name: '操作',
      type: 'relation[]',
      targetSingularCode: 'sys_action',
      linkTableName: 'oc_role_sys_action_links',
      targetIdColumnName: 'action_id',
      selfIdColumnName: 'role_id',
    },
  ],
};

export default entity;
