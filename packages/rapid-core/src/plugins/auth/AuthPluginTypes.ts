export type AuthPluginInitOptions = {
  /**
   * 用户实体代号。默认为`oc_user`
   */
  userEntitySingularCode?: string;

  /**
   * 个人资料属性。默认为`["id", "name", "login", "email", "department", "roles", "state", "createdAt"]`
   */
  profilePropertyCodes?: string[];
};
