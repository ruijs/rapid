import { IRpdServer } from "~/core/server";
import EntityManager from "~/dataAccess/entityManager";
import { LicenseSettings, RpdCert, RpdLicense } from "./LicensePluginTypes";
import { SystemSettingItem } from "../setting/SettingPluginTypes";
import SettingService from "../setting/SettingService";
import { extractCertLicense } from "./helpers/certHelper";

export interface GetSystemSettingValuesInput {
  groupCode: string;
}

export interface SetSystemSettingValuesInput {
  groupCode: string;
  values: Record<string, any>;
}

export interface GetUserSettingValuesInput {
  groupCode: string;
}

export default class LicenseService {
  #server: IRpdServer;
  #systemSettingItemManager: EntityManager<SystemSettingItem>;
  #encryptionKey: string;
  #license: RpdLicense;

  constructor(server: IRpdServer, encryptionKey: string) {
    this.#server = server;
    this.#encryptionKey = encryptionKey;

    this.#systemSettingItemManager = server.getEntityManager("system_setting_item");
  }

  async loadLicense(): Promise<void> {
    const settingService = this.#server.getService<SettingService>("settingService");
    const licenseSettings = await settingService.getSystemSettingValues("license");
    const { deployId } = licenseSettings as LicenseSettings;
    const certText = licenseSettings.cert;
    const certJSON = Buffer.from(certText, "base64").toString();
    const cert: RpdCert = JSON.parse(certJSON);

    try {
      const license = extractCertLicense(this.#encryptionKey, deployId, cert);
      this.#license = license;
    } catch (error) {
      this.#server.getLogger().error("Loading license failed.", error);
      throw new Error("Loading license failed.");
    }
  }

  async getLicense() {
    return this.#license;
  }
}
