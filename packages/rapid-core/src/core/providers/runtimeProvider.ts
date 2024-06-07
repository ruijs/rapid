export interface IRuntimeProvider {
  copyFile(fromPath: string, toPath: string): Promise<void>;

  removeFile(path: string): Promise<void>;
}
