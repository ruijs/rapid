import path from "path";
import { IPluginInstance } from "~/types";
import { readFile } from "~/utilities/fsUtility";
import { HttpHandlerContext } from "~/core/httpHandler";

export const code = "downloadFile";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: any,
) {
  const { server, applicationConfig, routerContext, input } = ctx;
  const { request, response } = routerContext;

  const dataAccessor = ctx.server.getDataAccessor({
    singularCode: "ecm_storage_object",
  });

  const storageObject = await dataAccessor.findById(input.fileId);
  if (!storageObject) {
    ctx.output = { error: new Error("Storage object not found.") };
    return;
  }

  const fileKey = storageObject.key;
  const filePathName = path.join(server.config.localFileStoragePath, fileKey);
  const attachmentFileName = input.fileName || path.basename(fileKey);

  response.body = await readFile(filePathName);
  response.headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(attachmentFileName)}"`)
}
