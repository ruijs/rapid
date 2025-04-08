import { isNil } from "lodash";
import { IRpdServer } from "~/core/server";
import { getEntityPropertyByCode, getEntityPropertyByFieldName } from "~/helpers/metaHelper";
import { RpdDataModel } from "~/types";
import { getDateString } from "~/utilities/timeUtility";

export async function validateEntity(server: IRpdServer, model: RpdDataModel, entity: any) {
  for (const propCode in entity) {
    let prop = getEntityPropertyByCode(server, model, propCode);
    if (!prop) {
      prop = getEntityPropertyByFieldName(server, model, propCode);
    }

    if (!prop) {
      continue;
    }

    if (propCode === "id") {
      if (isNil(entity[propCode])) {
        delete entity[propCode];
      }
    }

    if (prop.type === "date") {
      const originValue = entity[propCode];
      if (originValue) {
        entity[propCode] = getDateString(originValue);
      }
    }
  }

  return entity;
}
