import axios from "axios";
import rapidAppDefinition from "./rapidAppDefinition";

const apiBaseUrl = rapidAppDefinition.getApiBaseUrl();

const rapidApi = axios.create({
  baseURL: apiBaseUrl,
  validateStatus: null,
});

export default rapidApi;
