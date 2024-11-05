export type LicensePluginInitOptions = {
  encryptionKey: string;
};

export type RpdCert = {
  /**
   * 许可证id
   */
  id: string;

  /**
   * 公钥
   */
  pub: string;

  /**
   * 加密后的授权信息
   */
  lic: string;

  /**
   * authtag
   */
  tag: string;

  /**
   * 证书签名
   */
  sig: string;
};

export type RpdLicense = {
  /**
   * 颁发日期
   */
  issueDate: string;

  /**
   * 产品信息
   */
  product: RpdLicenseProduct;

  /**
   * 被授权人，客户信息
   */
  grantTo: RpdLicenseOwner;

  /**
   * 权限信息
   */
  authority: RpdLicenseAuthority;
};

export type RpdLicenseProduct = {
  name: string;
  version: string;
};

export type RpdLicenseOwner = {
  name: string;
};

export type RpdLicenseAuthority = {
  neverExpire: boolean;
  expireDate: string;
  quota?: Record<string, number | string | boolean>;
  functions?: string[];
};

export type RpdLicenseApplication = {
  /**
   * 部署识别码
   */
  deployId: string;

  /**
   * 产品信息
   */
  product: RpdLicenseProduct;

  /**
   * 申请人，客户信息
   */
  applicant: RpdLicenseOwner;

  /**
   * 权限信息
   */
  authority: RpdLicenseAuthority;
};

export type LicenseSettings = {
  deployId: string;
  cert: string;
};
