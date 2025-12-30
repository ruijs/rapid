import type { HttpRequestOptions, SimpleRockConfig } from "@ruiapp/move-style";
import { RapidToolbarActionBase } from "../../types/rapid-action-types";

export interface RapidToolbarHttpRequestButtonConfig extends RapidToolbarActionBase, HttpRequestOptions {}

export interface RapidToolbarHttpRequestButtonRockConfig extends SimpleRockConfig, RapidToolbarHttpRequestButtonConfig {}
