import { HttpRequestOptions, omitSystemRockConfigFields, Rock, RockConfig } from "@ruiapp/move-style";
import RapidToolbarHttpRequestButtonMeta from "./RapidToolbarHttpRequestButtonMeta";
import { renderRock } from "@ruiapp/react-renderer";
import { RapidToolbarHttpRequestButtonRockConfig } from "./rapid-toolbar-http-request-button-types";
import { omit, pick } from "lodash";
import { getExtensionLocaleStringResource } from "../../mod";

export default {
  $type: "rapidToolbarHttpRequestButton",

  Renderer(context, props: RapidToolbarHttpRequestButtonRockConfig) {
    const { framework } = context;
    const httpRequestPropNames: (keyof HttpRequestOptions)[] = ["method", "url", "urlParams", "query", "data", "headers", "onError", "onSuccess"];
    const httpRequestProps = pick(props, httpRequestPropNames);
    const buttonProps = omit(omitSystemRockConfigFields(props), httpRequestPropNames);

    if (!httpRequestProps.onSuccess) {
      httpRequestProps.onSuccess = [
        {
          $action: "antdToast",
          type: "info",
          content: getExtensionLocaleStringResource(framework, "operateSuccess"),
        },
      ];
    }
    if (!httpRequestProps.onError) {
      httpRequestProps.onError = [
        {
          $action: "antdToast",
          type: "error",
          $exps: {
            content: `'${getExtensionLocaleStringResource(framework, "operateError")} ' + $event.args[0].message`,
          },
        },
      ];
    }

    const rockConfig: RockConfig = {
      $id: `${props.$id}-rpdBtn`,
      $type: "rapidToolbarButton",
      ...buttonProps,
      onAction: [
        {
          $action: "sendHttpRequest",
          ...httpRequestProps,
        },
      ],
    };

    return renderRock({ context, rockConfig });
  },

  ...RapidToolbarHttpRequestButtonMeta,
} as Rock;
