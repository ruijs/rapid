export type SettingGroupSetting = {
  code: string;
  name: string;
  description?: string;
  permissionAssignments?: PermissionAssignment[];
};

export type SettingItemSetting = {
  group: SettingGroupSetting;
  orderNum: number;
  type: string;
  code: string;
  name: string;
  description?: string;
  config?: any;
};

export type SystemSettingItem = {
  id: number;
  groupCode: string;
  itemCode: string;
  value: any;
};

export type UserSettingItem = {
  id: number;
  ownerId: number;
  groupCode: string;
  itemCode: string;
  value: any;
};

export type PermissionAssignment = {
  assigneeType: string;
  assigneeId: number;
  actions: string[];
};
