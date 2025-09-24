import type { FindEntityOptions, RapidPage } from "@ruiapp/rapid-extension";
import type { AxiosInstance } from "axios";
import { detectChangedFields } from "../utils/ObjectChangesDetector";
import type { CreateRapidPageInput, IRapidModelUpdater, UpdateRapidPageInput, RapidPageEntity } from "./types";

function convertInputToEntity(input: RapidPage) {
  const inputEntity: RapidPageEntity = {
    subSystem: input.subSystem,
    appCode: input.appCode,
    code: input.code,
    parentCode: input.parentCode,
    routePath: input.routePath,
    name: input.name,
    title: input.title,
    permissionCheck: input.permissionCheck,
    config: {
      view: input.view,
      stores: input.stores,
      eventSubscriptions: input.eventSubscriptions,
      functions: input.functions,
      $i18n: input.$i18n,
      $locales: input.$locales,
    },
  };
  return inputEntity;
}

export function newPageUpdater(rapidConfigApi: AxiosInstance) {
  const pageUpdater: IRapidModelUpdater<RapidPageEntity, RapidPage> = {
    modelType: "page",
    relationFields: [],

    entityBatchMode: false,

    inputTitlePrinter(input) {
      return input.code;
    },

    entityKeyGetter(input) {
      return input.code;
    },

    async entitySingleFinder(entityKey: string) {
      const res = await rapidConfigApi.post(`meta/pages/operations/find`, {
        filters: [
          {
            operator: "eq",
            field: "code",
            value: entityKey,
          },
        ],
      } satisfies FindEntityOptions);

      const entities = res.data.list;
      if (entities && entities.length) {
        return entities[0];
      }

      return null;
    },

    entityExistensePredicate(input, entity) {
      return entity.code === input.code;
    },

    isEntityChanged(input, remoteEntity) {
      const inputEntity = convertInputToEntity(input);
      const changedFieldNames = detectChangedFields(inputEntity, remoteEntity, [
        "subSystem",
        "appCode",
        "code",
        "parentCode",
        "routePath",
        "name",
        "title",
        "config",
        "permissionCheck",
      ]);
      if (changedFieldNames.length) {
        console.log(`${this.modelType} ${this.inputTitlePrinter(inputEntity)} changed with these fields:`, changedFieldNames);
      }
      return changedFieldNames.length > 0;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async createEntity(input, mainEntity, inputIndex) {
      const createEntityInput: CreateRapidPageInput = convertInputToEntity(input);
      const res = await rapidConfigApi.post(`meta/pages`, createEntityInput);
      const { data } = res;
      if (!data.id) {
        console.log("Response:");
        console.log(data);
        console.log("Input:");
        console.log(createEntityInput);
      }
      return data;
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async updateEntity(input, remoteEntity, mainEntity, inputIndex) {
      const updateEntityInput: UpdateRapidPageInput = convertInputToEntity(input);
      const res = await rapidConfigApi.patch(`meta/pages/${remoteEntity.id}`, updateEntityInput);
      const { data } = res;
      if (!data.id) {
        console.log("Response:");
        console.log(data);
        console.log("Input:");
        console.log(updateEntityInput);
      }
      return data;
    },
  };

  return pageUpdater;
}
