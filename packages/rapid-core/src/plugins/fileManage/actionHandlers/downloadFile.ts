import path from "path";
import { readFile } from "~/utilities/fsUtility";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";

export type DownloadFileInput = {
  fileId?: string;
  fileKey?: string;
  fileName?: string;
  inline?: boolean;
};

export const code = "downloadFile";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, routerContext: routeContext } = ctx;
  const { request, response } = routeContext;
  //TODO: only public files can download by this handler

  const input: DownloadFileInput = ctx.input;

  let fileKey: string = input.fileKey;

  if (!fileKey && input.fileId) {
    const dataAccessor = ctx.server.getDataAccessor({
      singularCode: "ecm_storage_object",
    });

    const storageObject = await dataAccessor.findById(input.fileId, routeContext?.getDbTransactionClient());
    if (!storageObject) {
      ctx.output = { error: new Error("Storage object not found.") };
      return;
    }

    fileKey = storageObject.key;
  }
  const filePathName = path.join(server.config.localFileStoragePath, fileKey);
  const attachmentFileName = input.fileName || path.basename(fileKey);

  response.body = await readFile(filePathName);

  const dispositionType = input.inline ? "inline" : "attachment";
  response.headers.set("Content-Disposition", `${dispositionType}; filename="${encodeURIComponent(attachmentFileName)}"`);
}
