import { IRpdServer } from "~/core/server";
import EntityManager from "~/dataAccess/entityManager";
import { LicenseSettings, RpdCert, RpdLicense } from "./LicensePluginTypes";
import { SystemSettingItem } from "../setting/SettingPluginTypes";
import SettingService from "../setting/SettingService";
import { extractCertLicense } from "./helpers/certHelper";
import dayjs from "dayjs";
import { get, isString } from "lodash";
import { isNullOrUndefinedOrEmpty } from "~/utilities/typeUtility";

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

    if (!deployId || !certText) {
      this.#server.getLogger().warn("License was not loaded properly.");
      return;
    }

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

  getLicense() {
    return this.#license;
  }

  isExpired() {
    if (!this.#license) {
      return true;
    }

    const { neverExpire, expireDate } = this.#license.authority;

    if (neverExpire) {
      return false;
    }

    if (!expireDate) {
      return true;
    }

    const today = dayjs(dayjs().format("YYYY-MM-DD"));
    return today.isAfter(dayjs(expireDate));
  }

  getQuota(name: string) {
    if (!this.#license) {
      return null;
    }

    return get(this.#license.authority, `quota.${name}`, null);
  }

  isOutOfQuota(name: string, currentAmount: number) {
    const quotaLimit = this.getQuota(name);

    if (isNullOrUndefinedOrEmpty(quotaLimit)) {
      return true;
    }

    let quotaLimitAmount: string | number = quotaLimit;
    if (isString(quotaLimitAmount)) {
      quotaLimitAmount = parseInt(quotaLimit, 10);
    }

    if (quotaLimitAmount === -1) {
      return true;
    }

    return currentAmount > quotaLimitAmount;
  }

  isFunctionAllowed(name: string) {
    if (!this.#license) {
      return false;
    }

    const functions = get(this.#license.authority, "functions", []);
    return functions.includes(name);
  }
}
