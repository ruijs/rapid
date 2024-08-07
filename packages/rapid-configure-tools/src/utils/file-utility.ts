import fs from "fs";
import path from "path";

export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    const parentDirPath = path.dirname(dirPath);
    ensureDirectoryExists(parentDirPath);

    fs.mkdirSync(dirPath);
  }
}

export function enumFileBaseNamesInDirectory(dirPath: string, prefix: string = ""): string[] {
  let fileNames = [];

  let resolvedDirPath = dirPath;
  const isRelative = dirPath.startsWith(".") || dirPath.startsWith("..");
  if (isRelative) {
    resolvedDirPath = path.join(process.cwd(), dirPath);
  }

  if (!fs.existsSync(resolvedDirPath)) {
    console.warn(`Directory '${resolvedDirPath}' not found.`);
    return [];
  }

  const files = fs.readdirSync(resolvedDirPath);
  for (const fileName of files) {
    const filePathName = path.join(resolvedDirPath, fileName);
    const fileStat = fs.statSync(filePathName);
    if (fileStat.isDirectory()) {
      fileNames = fileNames.concat(enumFileBaseNamesInDirectory(filePathName, prefix ? `${prefix}/${fileName}` : fileName));
    } else if (fileStat.isFile()) {
      const baseName = path.parse(fileName).name;
      if (prefix) {
        fileNames.push(`${prefix}/${baseName}`);
      } else {
        fileNames.push(baseName);
      }
    }
  }

  fileNames.sort();
  return fileNames;
}
