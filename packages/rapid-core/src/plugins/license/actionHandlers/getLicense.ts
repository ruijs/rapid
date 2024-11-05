import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import LicenseService from "../LicenseService";

export interface GetLicenseOptions {}

export const code = "getLicense";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: GetLicenseOptions) {
  const { server, routerContext } = ctx;
  const { response } = routerContext;

  const licenseService = server.getService<LicenseService>("licenseService");

  const license = licenseService.getLicense();

  ctx.output = license;
}
