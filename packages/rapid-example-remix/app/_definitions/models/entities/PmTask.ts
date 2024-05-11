import type { TDictionaryCodes } from '../../meta/data-dictionary-codes';
import type { TEntitySingularCodes } from '../../meta/model-codes';
import type { RapidEntity } from '@ruiapp/rapid-extension';

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: 'app',
  code: 'PmTask',
  name: '任务',
  fields: [
    {
      code: 'code',
      name: 'code',
      type: 'text',
      required: true,
    },
    {
      code: 'title',
      name: '标题',
      type: 'text',
    },
    {
      code: 'description',
      name: '描述',
      type: 'text',
    },
    {
      code: 'done',
      name: '是否完成',
      type: 'boolean',
    },
  ],
};

export default entity;
