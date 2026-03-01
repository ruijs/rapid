import type { HttpRequestOptions, RockEventHandlerConfig, SimpleRockConfig } from "@ruiapp/move-style";
import type { RapidToolbarButtonProps } from "../rapid-toolbar-button/rapid-toolbar-button-types";

export const RAPID_TOOLBAR_HTTP_REQUEST_BUTTON_ROCK_TYPE = "rapidToolbarHttpRequestButton" as const;

export interface RapidToolbarHttpRequestButtonProps extends Omit<RapidToolbarButtonProps, "url">, Omit<HttpRequestOptions, "onSuccess" | "onError"> {
  onSuccess?: RockEventHandlerConfig | ((response: any) => void);
  onError?: RockEventHandlerConfig | ((error: any) => void);
}

export interface RapidToolbarHttpRequestButtonRockConfig extends SimpleRockConfig, Omit<RapidToolbarHttpRequestButtonProps, "onSuccess" | "onError"> {
  $type: typeof RAPID_TOOLBAR_HTTP_REQUEST_BUTTON_ROCK_TYPE;
  onSuccess?: RockEventHandlerConfig;
  onError?: RockEventHandlerConfig;
}
