import path from "path";
import { type RapidModelsUpdateOptions, RapidModelsUpdater } from "@ruiapp/rapid-configure-tools";
import EntityModels from "../_definitions/meta/entity-models";
import DataDictionaryModels from "../_definitions/meta/data-dictionary-models";

const env = process.env;

const updateOptions: RapidModelsUpdateOptions = {
  appDataDirLocation: path.join(process.cwd(), "app", ".benzene-data"),
  rapidApiUrl: env.RAPID_API_URL || "http://127.0.0.1:8000/api",
  entities: EntityModels,
  dataDictionaries: DataDictionaryModels,
};

const updater = new RapidModelsUpdater(updateOptions);
updater.updateRapidSystemConfigurations();
