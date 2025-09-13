import {
  handleComponentEvent,
  HttpRequestOptions,
  type EventAction,
  type Framework,
  type Page,
  type RockEventHandlerConfig,
  type Scope,
} from "@ruiapp/move-style";
import { getRapidApi } from "../rapidApi";
import { AxiosResponse } from "axios";
import { RapidFormSubmitOptions } from "../types/rapid-action-types";

export interface RockEventHandlerSaveRapidEntity {
  $action: "saveRapidEntity";
  entityNamespace: string;
  entityPluralCode: string;
  customRequest?: {
    url: HttpRequestOptions["url"];
    method?: HttpRequestOptions["method"];
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
  const submitData = eventArgs[0];
  const submitOptions = eventArgs[1] as RapidFormSubmitOptions;
  const rapidApi = getRapidApi();
  const { entityId, onSuccess, onError } = eventHandler;
  let { customRequest } = eventHandler;
  try {
    let res: AxiosResponse<any, any>;
    const requestData = Object.assign({}, submitData, eventHandler.fixedFields);

    if (submitOptions && submitOptions.submitUrl) {
      customRequest = {
        method: submitOptions.submitMethod as any,
        url: submitOptions.submitUrl,
      };
    }

    if (customRequest) {
      res = await rapidApi[(customRequest.method || "post").toLowerCase()](customRequest.url, requestData);
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
        await handleComponentEvent("onSuccess", framework, page, scope, sender, onSuccess, [res.data, submitData, submitOptions]);
      }
    } else {
      if (onError) {
        await handleComponentEvent("onError", framework, page, scope, sender, onError, [err, submitData, submitOptions]);
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
