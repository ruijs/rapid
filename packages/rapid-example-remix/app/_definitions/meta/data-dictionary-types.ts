/**
 * Bug等级
 */
export type BugLevel =
  | 'critical'
  | 'error'
  | 'suggest'
  ;

/**
 * 启用/禁用状态
 */
export type EnabledDisabledState =
  | 'enabled'
  | 'disabled'
  ;

/**
 * 项目状态
 */
export type PmProjectState =
  | 'active'
  | 'suspended'
  | 'closed'
  ;

/**
 * 发布状态
 */
export type PublishState =
  | 'draft'
  | 'in_review'
  | 'published'
  | 'archived'
  | 'withdrawed'
  ;

/**
 * 任务状态
 */
export type TaskState =
  | 'pending'
  | 'processing'
  | 'done'
  | 'closed'
  | 'reopened'
  ;

/**
 * 任务类型
 */
export type TaskType =
  | 'documenting'
  | 'development'
  | 'bug'
  | 'deployment'
  | 'training'
  | 'meeting'
  ;

/**
 * 未删除/已删除状态
 */
export type UndeletedDeletedState =
  | 'undeleted'
  | 'deleted'
  ;

/**
 * 定时任务运行结果
 */
export type SysCronJobRunningResult =
  | 'success'
  | 'failed'
  | 'error'
  ;
