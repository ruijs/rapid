import fs from "fs";

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
