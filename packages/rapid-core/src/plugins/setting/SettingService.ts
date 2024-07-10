import { IRpdServer } from "~/core/server";
import EntityManager from "~/dataAccess/entityManager";
import { SystemSettingItem, UserSettingItem } from "./SettingPluginTypes";

export interface GetSystemSettingValuesInput {
  groupCode: string;
}

export interface SetSystemSettingValuesInput {
  groupCode: string;
  values: Record<string, any>;
}

export interface GetUserSettingValuesInput {
  groupCode: string;
}

export default class SettingService {
  #server: IRpdServer;
  #systemSettingItemManager: EntityManager<SystemSettingItem>;
  #userSettingItemManager: EntityManager<UserSettingItem>;

  constructor(server: IRpdServer) {
    this.#server = server;

    this.#systemSettingItemManager = server.getEntityManager("system_setting_item");
    this.#userSettingItemManager = server.getEntityManager("user_setting_item");
  }

  //#region System Setting
  async getSystemSettingItems(groupCode: string): Promise<SystemSettingItem[]> {
    return await this.#systemSettingItemManager.findEntities({
      filters: [
        {
          operator: "eq",
          field: "groupCode",
          value: groupCode,
        },
      ],
    });
  }

  async getSystemSettingValues(groupCode: string): Promise<Record<string, any>> {
    const settingItems = await this.getSystemSettingItems(groupCode);

    return settingItems.reduce<Record<string, any>>((settingValues, settingItem) => {
      settingValues[settingItem.itemCode] = settingItem.value;
      return settingValues;
    }, {});
  }

  async getSystemSettingValue(groupCode: string, itemCode: string): Promise<any> {
    const settingItem = await this.#systemSettingItemManager.findEntity({
      filters: [
        {
          operator: "eq",
          field: "groupCode",
          value: groupCode,
        },
        {
          operator: "eq",
          field: "itemCode",
          value: itemCode,
        },
      ],
    });

    return settingItem ? settingItem.value : null;
  }

  async setSystemSettingValue(groupCode: string, itemCode: string, value: any) {
    const settingItem = await this.#systemSettingItemManager.findEntity({
      filters: [
        {
          operator: "eq",
          field: "groupCode",
          value: groupCode,
        },
        {
          operator: "eq",
          field: "itemCode",
          value: itemCode,
        },
      ],
    });

    if (settingItem) {
      if (settingItem.value !== value) {
        await this.#systemSettingItemManager.updateEntityById({
          id: settingItem.id,
          entityToSave: {
            value,
          },
        });
      }
    } else {
      await this.#systemSettingItemManager.createEntity({
        entity: {
          groupCode,
          itemCode,
          value,
        } as Partial<SystemSettingItem>,
      });
    }
  }

  async setSystemSettingValues(groupCode: string, settingValues: Record<string, any>) {
    for (const itemCode in settingValues) {
      const value = settingValues[itemCode];
      await this.setSystemSettingValue(groupCode, itemCode, value);
    }
  }
  //#endregion

  //#region User Setting
  async getUserSettingItems(ownerId: number, groupCode: string): Promise<UserSettingItem[]> {
    return await this.#userSettingItemManager.findEntities({
      filters: [
        {
          operator: "eq",
          field: "ownerId",
          value: ownerId,
        },
        {
          operator: "eq",
          field: "groupCode",
          value: groupCode,
        },
      ],
    });
  }

  async getUserSettingValues(ownerId: number, groupCode: string): Promise<Record<string, any>> {
    const settingItems = await this.getUserSettingItems(ownerId, groupCode);

    return settingItems.reduce<Record<string, any>>((settingValues, settingItem) => {
      settingValues[settingItem.itemCode] = settingItem.value;
      return settingValues;
    }, {});
  }

  async getUserSettingValue(ownerId: number, groupCode: string, itemCode: string): Promise<any> {
    const settingItem = await this.#systemSettingItemManager.findEntity({
      filters: [
        {
          operator: "eq",
          field: "ownerId",
          value: ownerId,
        },
        {
          operator: "eq",
          field: "groupCode",
          value: groupCode,
        },
        {
          operator: "eq",
          field: "itemCode",
          value: itemCode,
        },
      ],
    });

    return settingItem ? settingItem.value : null;
  }

  async setUserSettingValue(ownerId: number, groupCode: string, itemCode: string, value: any) {
    const settingItem = await this.#userSettingItemManager.findEntity({
      filters: [
        {
          operator: "eq",
          field: "ownerId",
          value: ownerId,
        },
        {
          operator: "eq",
          field: "groupCode",
          value: groupCode,
        },
        {
          operator: "eq",
          field: "itemCode",
          value: itemCode,
        },
      ],
    });

    if (settingItem) {
      await this.#userSettingItemManager.updateEntityById({
        id: settingItem.id,
        entityToSave: {
          value,
        },
      });
    } else {
      await this.#systemSettingItemManager.createEntity({
        entity: {
          ownerId: ownerId,
          groupCode,
          itemCode,
          value,
        } as Partial<UserSettingItem>,
      });
    }
  }

  async setUserSettingValues(ownerId: number, groupCode: string, settingValues: Record<string, any>) {
    for (const itemCode in settingValues) {
      const value = settingValues[itemCode];
      await this.setUserSettingValue(ownerId, groupCode, itemCode, value);
    }
  }
  //#endregion
}
