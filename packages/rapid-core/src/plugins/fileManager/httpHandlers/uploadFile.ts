import { v1 as uuidv1 } from "uuid";
import { IPluginInstance } from "~/types";
import { appendFile } from "~/utilities/fsUtility";
import { HttpHandlerContext } from "~/core/httpHandler";
import path from "path";
import { isArray } from "lodash";

export const code = "uploadFile";

export async function handler(
  plugin: IPluginInstance,
  ctx: HttpHandlerContext,
  options: any,
) {
  const { server, applicationConfig, routerContext, input } = ctx;
  const { request, response } = routerContext;

  let file: File | File[] | null = input.files;
  if (isArray(file)) {
    file = file[0];
  }

  if (!file) {
    ctx.status = 400;
    ctx.output = { error: "File not found in request body."};
    return;
  }

  const extName = path.extname(file.name);
  const fileKey = `${uuidv1()}${extName}`
  const filePathName = path.join(server.config.localFileStoragePath, fileKey);

  const fileBuffer = await file.arrayBuffer();
  await appendFile(filePathName, fileBuffer);

  ctx.output = { ok: true, fileKey };
}
