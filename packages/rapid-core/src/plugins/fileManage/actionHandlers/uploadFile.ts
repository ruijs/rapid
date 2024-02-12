import { v1 as uuidv1 } from "uuid";
import { appendFile } from "~/utilities/fsUtility";
import { ActionHandlerContext } from "~/core/actionHandler";
import path from "path";
import { isArray } from "lodash";
import { RapidPlugin } from "~/core/server";

export const code = "uploadFile";

export async function handler(
  plugin: RapidPlugin,
  ctx: ActionHandlerContext,
  options: any,
) {
  const { server, applicationConfig, routerContext, input } = ctx;
  const { request, response } = routerContext;

  let file: File | File[] | null = input.file || input.files;
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
