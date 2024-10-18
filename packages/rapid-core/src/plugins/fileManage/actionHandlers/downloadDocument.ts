import path from "path";
import { ActionHandlerContext } from "~/core/actionHandler";
import { RapidPlugin } from "~/core/server";
import { readFile } from "~/utilities/fsUtility";
import { getFileBaseName } from "~/utilities/pathUtility";

export const code = "downloadDocument";

export async function handler(plugin: RapidPlugin, ctx: ActionHandlerContext, options: any) {
  const { server, applicationConfig, routerContext, input } = ctx;
  const { request, response } = routerContext;

  const documentDataAccessor = ctx.server.getDataAccessor({
    singularCode: "ecm_document",
  });
  const revisionDataAccessor = ctx.server.getDataAccessor({
    singularCode: "ecm_revision",
  });
  const storageDataAccessor = ctx.server.getDataAccessor({
    singularCode: "ecm_storage_object",
  });

  let storageObjectId = 0;
  let fileName: string;
  let { revisionId, documentId } = input;
  if (revisionId) {
    const revision = await revisionDataAccessor.findById(revisionId);
    if (!revision) {
      ctx.output = { error: new Error(`Revision with id "${revisionId}" was not found.`) };
      return;
    }
    storageObjectId = revision.storage_object_id;

    documentId = revision.document_id;
    const document = await documentDataAccessor.findById(documentId);
    if (!document) {
      ctx.output = { error: new Error(`Document with id "${documentId}" was not found.`) };
      return;
    }
    fileName = `${getFileBaseName(document.name!)}${revision.ext_name}`;
  } else if (documentId) {
    const document = await documentDataAccessor.findById(documentId);
    if (!document) {
      ctx.output = { error: new Error(`Document with id "${documentId}" was not found.`) };
      return;
    }
    storageObjectId = document.storage_object_id;
    fileName = document.name;
  } else {
    ctx.output = { error: new Error(`Parameter "revisionId" or "documentId" must be provided.`) };
    return;
  }

  const storageObject = await storageDataAccessor.findById(storageObjectId);
  if (!storageObject) {
    ctx.output = { error: new Error(`Storage object with id "${storageObjectId}" was not found.`) };
    return;
  }

  const fileKey = storageObject.key;
  const filePathName = path.join(server.config.localFileStoragePath, fileKey);

  response.body = await readFile(filePathName);
  response.headers.set("Content-Disposition", `attachment; filename="${encodeURIComponent(fileName)}"`);
}
