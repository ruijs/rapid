import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import LicenseService from "../LicenseService";

export interface UpdateLicenseOptions {}

export interface UpdateLicenseInput {
  certText: string;
}

export const code = "updateLicense";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: UpdateLicenseOptions) {
  const { server, routerContext } = ctx;
  const { response } = routerContext;

  const input: UpdateLicenseInput = ctx.input;

  const licenseService = server.getService<LicenseService>("licenseService");

  const license = await licenseService.updateLicense(input.certText);

  ctx.output = license;
}
