import axios from "axios";
import ruiPlayerConfig from "./rui-player-config";

const rapidApi = axios.create({
  baseURL: ruiPlayerConfig.apiBase,
  validateStatus: null,
});

export default rapidApi;
