import type {
  BugLevel,
  EnabledDisabledState,
  PmProjectState,
  SysCronJobRunningResult,
  TaskState,
} from "./data-dictionary-types";
export type FileOrImageFieldType = { key: string; name: string; size: number; type: string };
/**
 * 班次
 */
export interface BaseShift {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 开始时间
   */
  beginTime: string;
  /**
   * 结束时间
   */
  endTime: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 班次
 */
export type SaveBaseShiftInput = Omit<BaseShift, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 部门
 */
export interface OcDepartment {
  /**
   * id
   */
  id: number;
  /**
   * 上级部门
   */
  parent?: Partial<OcDepartment>;
  /**
   * Code
   */
  code?: string;
  /**
   * 名称
   */
  name?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 用户
   */
  users?: Partial<OcUser>[];
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 部门
 */
export type SaveOcDepartmentInput = Omit<OcDepartment, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 角色
 */
export interface OcRole {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序
   */
  orderNum: number;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * 用户
   */
  users?: Partial<OcUser>[];
  /**
   * 操作
   */
  actions?: Partial<SysAction>[];
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 角色
 */
export type SaveOcRoleInput = Omit<OcRole, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 用户
 */
export interface OcUser {
  /**
   * id
   */
  id: number;
  /**
   * 姓名
   */
  name: string;
  /**
   * 登录账号
   */
  login: string;
  /**
   * 密码
   */
  password?: string;
  /**
   * 是否隐藏
   */
  hidden: boolean;
  /**
   * 状态
   */
  state: EnabledDisabledState;
  /**
   * Email
   */
  email?: string;
  /**
   * 生日
   */
  birthday?: string;
  /**
   * 头像
   */
  avatar?: FileOrImageFieldType;
  /**
   * 部门
   */
  department?: Partial<OcDepartment>;
  /**
   * 角色
   */
  roles?: Partial<OcRole>[];
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 用户
 */
export type SaveOcUserInput = Omit<OcUser, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * Bug
 */
export interface PmBugIssue {
  /**
   * id
   */
  id: number;
  /**
   * Bug等级
   */
  bugLevel?: BugLevel;
}

/**
 * Bug
 */
export type SavePmBugIssueInput = Omit<PmBugIssue, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目日志
 */
export interface PmLog {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project?: Partial<PmProject>;
  /**
   * 日期
   */
  logDate: string;
  /**
   * 内容
   */
  content?: string;
  /**
   * 照片
   */
  pictures?: FileOrImageFieldType[];
  /**
   * 附件
   */
  attachments?: FileOrImageFieldType[];
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目日志
 */
export type SavePmLogInput = Omit<PmLog, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 项目
 */
export interface PmProject {
  /**
   * id
   */
  id: number;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序号
   */
  orderNum?: number;
  /**
   * 项目状态
   */
  state?: PmProjectState;
  /**
   * 任务类型
   */
  allowedTaskTypes?: TaskType[];
  /**
   * 任务
   */
  tasks?: Partial<PmTask>[];
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 项目
 */
export type SavePmProjectInput = Omit<PmProject, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 任务
 */
export interface PmTask {
  /**
   * id
   */
  id: number;
  /**
   * 项目
   */
  project?: Partial<PmProject>;
  /**
   * code
   */
  code: string;
  /**
   * 标题
   */
  title: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 任务类型
   */
  taskType?: string;
  /**
   * 状态
   */
  state?: TaskState;
  /**
   * 权限
   */
  permissions?: Record<string, any>;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 任务
 */
export type SavePmTaskInput = Omit<PmTask, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统操作
 */
export interface SysAction {
  /**
   * id
   */
  id: number;
  /**
   * 分组
   */
  group: Partial<SysActionGroup>;
  /**
   * Code
   */
  code: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统操作
 */
export type SaveSysActionInput = Omit<SysAction, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 系统操作分组
 */
export interface SysActionGroup {
  /**
   * id
   */
  id: number;
  /**
   * Code
   */
  code?: string;
  /**
   * 名称
   */
  name: string;
  /**
   * 排序号
   */
  orderNum: number;
  /**
   * 操作项
   */
  items: Partial<SysAction>[];
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 系统操作分组
 */
export type SaveSysActionGroupInput = Omit<SysActionGroup, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;

/**
 * 定时任务
 */
export interface SysCronJob {
  /**
   * id
   */
  id: number;
  /**
   * Code
   */
  code: string;
  /**
   * 描述
   */
  description?: string;
  /**
   * cron表达式
   */
  cronTime?: string;
  /**
   * 是否禁用
   */
  disabled: boolean;
  /**
   * 任务选项
   */
  jobOptions?: Record<string, any>;
  /**
   * 是否正在运行
   */
  isRunning: boolean;
  /**
   * 下次运行时间
   */
  nextRunningTime?: string;
  /**
   * 最后运行时间
   */
  lastRunningTime?: string;
  /**
   * 最后运行结果
   */
  lastRunningResult?: SysCronJobRunningResult;
  /**
   * 错误信息
   */
  lastError?: string;
  /**
   * 操作处理器编码
   */
  actionHandlerCode?: string;
  /**
   * 操作处理函数
   */
  handler?: string;
  /**
   * 处理选项
   */
  handleOptions?: Record<string, any>;
  /**
   * 错误处理函数
   */
  onError?: string;
  /**
   * 创建时间
   */
  createdAt?: string;
  /**
   * 创建人
   */
  createdBy?: Partial<OcUser>;
  /**
   * 更新时间
   */
  updatedAt?: string;
  /**
   * 更新人
   */
  updatedBy?: Partial<OcUser>;
  /**
   * 删除时间
   */
  deletedAt?: string;
  /**
   * 删除人
   */
  deletedBy?: Partial<OcUser>;
}

/**
 * 定时任务
 */
export type SaveSysCronJobInput = Omit<SysCronJob, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy'>;
