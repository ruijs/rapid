import fs from "fs";
import path from "path";

export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    const parentDirPath = path.dirname(dirPath);
    ensureDirectoryExists(parentDirPath);

    fs.mkdirSync(dirPath);
  }
}

export type EnumFileBaseNamesOptions = {
  dirPath: string;
  prefix?: string;
  fileNameFilter?: (fileName: string) => boolean;
};

export function enumFileBaseNamesInDirectory(options: EnumFileBaseNamesOptions): string[] {
  const { dirPath, prefix, fileNameFilter } = options;
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
      fileNames = fileNames.concat(
        enumFileBaseNamesInDirectory({
          dirPath: filePathName,
          prefix: prefix ? `${prefix}/${fileName}` : fileName,
          fileNameFilter,
        }),
      );
    } else if (fileStat.isFile()) {
      if (fileNameFilter && !fileNameFilter(fileName)) {
        continue;
      }

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
