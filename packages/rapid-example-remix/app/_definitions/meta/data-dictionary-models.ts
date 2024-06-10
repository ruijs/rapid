import type { RapidDataDictionary as TRapidDataDictionary } from '@ruiapp/rapid-extension';
import BugLevel from '../models/data-dictionaries/BugLevel';
import EnabledDisabledState from '../models/data-dictionaries/EnabledDisabledState';
import PublishState from '../models/data-dictionaries/PublishState';
import TaskState from '../models/data-dictionaries/TaskState';
import UndeletedDeletedState from '../models/data-dictionaries/UndeletedDeletedState';

export default [
  BugLevel,
  EnabledDisabledState,
  PublishState,
  TaskState,
  UndeletedDeletedState,
] as TRapidDataDictionary[];
