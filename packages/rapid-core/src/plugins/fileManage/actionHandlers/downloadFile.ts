import path from "path";
import { readFile } from "~/utilities/fsUtility";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export const code = "downloadFile";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, applicationConfig, routerContext, input } = ctx;
  const { request, response } = routerContext;
  //TODO: only public files can download by this handler

  let fileKey: string = input.fileKey;

  if (!fileKey && input.fileId) {
    const dataAccessor = ctx.server.getDataAccessor({
      singularCode: "ecm_storage_object",
    });

    const storageObject = await dataAccessor.findById(input.fileId);
    if (!storageObject) {
      ctx.output = { error: new Error("Storage object not found.") };
      return;
    }

    fileKey = storageObject.key;
  }
  const filePathName = path.join(server.config.localFileStoragePath, fileKey);
  const attachmentFileName = input.fileName || path.basename(fileKey);

  response.body = await readFile(filePathName);
  response.headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(attachmentFileName)}"`);
}
