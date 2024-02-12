import path from "path";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { readFile } from "~/utilities/fsUtility";

export const code = "downloadDocument";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: any,
) {
  const { server, applicationConfig, routerContext, input } = ctx;
  const { request, response } = routerContext;

  const documentDataAccessor = ctx.server.getDataAccessor({
    singularCode: "ecm_document",
  });
  const storageDataAccessor = ctx.server.getDataAccessor({
    singularCode: "ecm_storage_object",
  });

  const document = await documentDataAccessor.findById(input.documentId);
  if (!document) {
    ctx.output = { error: new Error("Document not found.") };
    return;
  }
  const storageObject = await storageDataAccessor.findById(document.storage_object_id);
  if (!storageObject) {
    ctx.output = { error: new Error("Storage object not found.") };
    return;
  }

  const fileKey = storageObject.key;
  const filePathName = path.join(server.config.localFileStoragePath, fileKey);
  const attachmentFileName = document.name;

  response.body = await readFile(filePathName);
  response.headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(attachmentFileName)}"`)
}
