import { isArray, isObject } from "lodash";
import { RapidRequest } from "./request";
import { RapidResponse } from "./response";
import { HttpStatus, ResponseData } from "./http-types";

export type Next = () => Promise<void>;

export class RouteContext {
  readonly request: RapidRequest;
  readonly response: RapidResponse;
  readonly state: Record<string, any>;
  method: string;
  path: string;
  status: HttpStatus;
  params: Record<string, string>;

  constructor(request: RapidRequest) {
    this.request = request;
    this.state = {};
    this.response = new RapidResponse();
  }

  set(headerName: string, headerValue: string) {
    this.response.headers.set(headerName, headerValue);
  }

  json(
    obj: any,
    status?: HttpStatus,
    headers?: HeadersInit,
  ) {
    this.response.json(obj, status, headers);
  }

  redirect(url: string, status?: HttpStatus) {
    this.response.redirect(url, status);
  }
}