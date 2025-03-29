import type { RapidDataDictionary as TRapidDataDictionary } from '@ruiapp/rapid-extension';
import BugLevel from '../models/data-dictionaries/BugLevel';
import EnabledDisabledState from '../models/data-dictionaries/EnabledDisabledState';
import PmProjectState from '../models/data-dictionaries/PmProjectState';
import PublishState from '../models/data-dictionaries/PublishState';
import TaskState from '../models/data-dictionaries/TaskState';
import TaskType from '../models/data-dictionaries/TaskType';
import UndeletedDeletedState from '../models/data-dictionaries/UndeletedDeletedState';
import sys$SysCronJobRunningResult from '../models/data-dictionaries/sys/SysCronJobRunningResult';

export default [
  BugLevel,
  EnabledDisabledState,
  PmProjectState,
  PublishState,
  TaskState,
  TaskType,
  UndeletedDeletedState,
  sys$SysCronJobRunningResult,
] as TRapidDataDictionary[];
