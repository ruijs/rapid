import axios, { AxiosInstance } from "axios";
import rapidAppDefinition from "./rapidAppDefinition";

let rapidApi: AxiosInstance | null = null;

export function initRapidApi() {
  const apiBaseUrl = rapidAppDefinition.getApiBaseUrl();
  rapidApi = axios.create({
    baseURL: apiBaseUrl,
    validateStatus: null,
  });
}

export function getRapidApi() {
  if (!rapidApi) {
    initRapidApi();
  }
  return rapidApi;
}
