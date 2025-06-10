import { handleComponentEvent, type EventAction, type Framework, type Page, type RockEventHandlerConfig, type Scope } from "@ruiapp/move-style";
import { message } from "antd";
import { getRapidApi } from "../rapidApi";
import { AxiosResponse } from "axios";

export interface RockEventHandlerSaveRapidEntity {
  $action: "saveRapidEntity";
  entityNamespace: string;
  entityPluralCode: string;
  customRequest?: {
    url: string;
    method?: "patch" | "post" | "put";
  };
  entityId?: string | number;
  fixedFields?: Record<string, any>;
  onSuccess?: RockEventHandlerConfig;
  onError?: RockEventHandlerConfig;
}

export async function saveRapidEntity(
  eventName: string,
  framework: Framework,
  page: Page,
  scope: Scope,
  sender: any,
  eventHandler: RockEventHandlerSaveRapidEntity,
  eventArgs: any,
) {
  const entity = eventArgs[0];
  const rapidApi = getRapidApi();
  const { entityId, onSuccess, onError, customRequest } = eventHandler;
  try {
    let res: AxiosResponse<any, any>;
    const requestData = Object.assign({}, entity, eventHandler.fixedFields);

    if (customRequest) {
      res = await rapidApi[customRequest.method || "post"](customRequest.url, requestData);
    } else {
      if (entityId) {
        res = await rapidApi.patch(`${eventHandler.entityNamespace}/${eventHandler.entityPluralCode}/${entityId}`, requestData);
      } else {
        res = await rapidApi.post(`${eventHandler.entityNamespace}/${eventHandler.entityPluralCode}`, requestData);
      }
    }

    let isSuccessfull = false;
    let err = null;
    if (res.status >= 200 && res.status <= 299) {
      if (res.data.error) {
        isSuccessfull = false;
        err = res.data.error || {};
      } else {
        isSuccessfull = true;
      }
    } else {
      isSuccessfull = false;
      err = res.data.error || {};
    }

    if (isSuccessfull) {
      if (onSuccess) {
        await handleComponentEvent("onSuccess", framework, page, scope, sender, onSuccess, [res.data]);
      }
    } else {
      if (onError) {
        await handleComponentEvent("onError", framework, page, scope, sender, onError, [err]);
      }
    }

    return res.data;
  } catch (err: any) {
    if (onError) {
      await handleComponentEvent("onError", framework, page, scope, sender, onError, [err]);
    }
  }
}

export default {
  name: "saveRapidEntity",
  handler: saveRapidEntity,
} as EventAction<RockEventHandlerSaveRapidEntity>;
