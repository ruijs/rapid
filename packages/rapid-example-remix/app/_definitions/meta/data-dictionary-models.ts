import type { RapidDataDictionary as TRapidDataDictionary } from '@ruiapp/rapid-extension';
import BugLevel from '../models/data-dictionaries/BugLevel';
import CronJobRunningResult from '../models/data-dictionaries/CronJobRunningResult';
import EnabledDisabledState from '../models/data-dictionaries/EnabledDisabledState';
import PmProjectState from '../models/data-dictionaries/PmProjectState';
import PublishState from '../models/data-dictionaries/PublishState';
import TaskState from '../models/data-dictionaries/TaskState';
import TaskType from '../models/data-dictionaries/TaskType';
import UndeletedDeletedState from '../models/data-dictionaries/UndeletedDeletedState';

export default [
  BugLevel,
  CronJobRunningResult,
  EnabledDisabledState,
  PmProjectState,
  PublishState,
  TaskState,
  TaskType,
  UndeletedDeletedState,
] as TRapidDataDictionary[];
