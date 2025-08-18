import fs from "fs";
import path from "path";

export async function readFile(path: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    fs.readFile(path, null, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

export async function copyFile(fromPath: string, toPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.copyFile(fromPath, toPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function removeFile(path: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rm(path, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function moveFile(fromPath: string, toPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.rename(fromPath, toPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function appendFile(path: string, data: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.appendFile(path, Buffer.from(data), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export async function writeFile(path: string, data: ArrayBuffer): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, Buffer.from(data), (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

export function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    const parentDirPath = path.dirname(dirPath);
    if (parentDirPath == dirPath) {
      return;
    }
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
