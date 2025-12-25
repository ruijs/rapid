import axios, { AxiosInstance } from "axios";
import rapidAppDefinition from "./rapidAppDefinition";

let rapidApi: AxiosInstance | null = null;

export function initRapidApi() {
  const apiBaseUrl = rapidAppDefinition.getApiBaseUrl();
  rapidApi = axios.create({
    baseURL: apiBaseUrl,
    validateStatus: null,
  });

  rapidApi.interceptors.response.use((response) => {
    if (response.status >= 400) {
      const responseData = response.data;
      const message = responseData?.error?.message || responseData?.message || response.statusText;
      const code = responseData?.error?.code || responseData?.code || response.status;
      const error: any = new Error(message);
      error.code = code;
      error.response = response;
      throw error;
    }
    return response;
  });
}

export function getRapidApi() {
  if (!rapidApi) {
    initRapidApi();
  }
  return rapidApi;
}
