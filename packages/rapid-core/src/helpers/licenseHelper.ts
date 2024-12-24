import { get } from "lodash";
import { IRpdServer } from "~/core/server";
import { Logger } from "~/facilities/log/LogFacility";
import LicenseService from "~/plugins/license/LicenseService";

export function validateLicense(logger: Logger, server: IRpdServer) {
  const licenseService = server.getService<LicenseService>("licenseService");
  const license = licenseService.getLicense();
  if (!license) {
    const errorMessage = `无法获取系统授权信息。`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
  if (licenseService.isExpired()) {
    const expireDate = get(license.authority, "expireDate");
    const errorMessage = `您的系统授权已于${expireDate}过期。`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}
