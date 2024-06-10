import type { TDictionaryCodes } from '../../../meta/data-dictionary-codes';
import type { TEntitySingularCodes } from '../../../meta/model-codes';
import type { RapidEntity } from '@ruiapp/rapid-extension';

const entity: RapidEntity<TEntitySingularCodes, TDictionaryCodes> = {
  namespace: 'app',
  code: 'PmBugIssue',
  name: 'Bug',
  base: 'pm_task',
  derivedType: "bug",
  fields: [
    {
      code: 'bugLevel',
      name: 'Bug等级',
      type: 'option',
      dataDictionary: 'BugLevel',
    },
  ],
};

export default entity;
