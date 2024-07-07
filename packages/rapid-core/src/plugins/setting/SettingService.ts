import { IRpdServer } from "~/core/server";

export interface GetSystemSettingValuesInput {
  groupCode: string;
}

export default class SequenceService {
  #server: IRpdServer;

  constructor(server: IRpdServer) {
    this.#server = server;
  }

  async getSystemSettingValues(input: GetSystemSettingValuesInput) {}

  async setSystemSettingValue(groupCode: string, itemCode: string, value: any) {}
}
