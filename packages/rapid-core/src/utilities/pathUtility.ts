import path from "path";

export function getFileExtensionName(pathname: string) {
  return path.extname(pathname);
}

export function getFileName(pathname: string) {
  return path.basename(pathname);
}

export function getFileBaseName(pathname: string) {
  const extName = path.extname(pathname);
  return path.basename(pathname, extName);
}
