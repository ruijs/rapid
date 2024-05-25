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
      required: true,
    },
    {
      code: 'description',
      name: '描述',
      type: 'text',
    },
    {
      code: 'state',
      name: '状态',
      type: 'option',
      dataDictionary: 'TaskState',
      defaultValue: "'pending'",
      config: {
        stateMachine: {
          enabled: true,
          config: {
            states: {
              done: {
                on: {
                  close: "closed",
                  reopen: "reopened"
                }
              },
              closed: {},
              pending: {
                on: {
                  start: "processing"
                }
              },
              reopened: {
                on: {
                  start: "processing"
                }
              },
              processing: {
                on: {
                  pause: "pending",
                  finish: "done"
                }
              }
            },
            initial: "pending"
          }
        }
      }
    },
  ],
};

export default entity;
