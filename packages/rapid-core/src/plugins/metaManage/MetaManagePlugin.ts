/**
 * Meta manager plugin
 */

import {
  QuoteTableOptions,
  RpdApplicationConfig,
  RpdDataDictionary,
  RpdDataModel,
  RpdDataModelProperty,
  RpdEntityCreateEventPayload,
  RpdEntityDeleteEventPayload,
  RpdEntityUpdateEventPayload,
} from "~/types";
import {
  IRpdServer,
  RapidPlugin,
  RpdConfigurationItemOptions,
  RpdServerPluginConfigurableTargetOptions,
  RpdServerPluginExtendingAbilities,
} from "~/core/server";

import * as listMetaModels from "./actionHandlers/listMetaModels";
import * as listMetaRoutes from "./actionHandlers/listMetaRoutes";
import * as getMetaModelDetail from "./actionHandlers/getMetaModelDetail";
import { getEntityPropertiesIncludingBase, isRelationProperty } from "~/helpers/metaHelper";
import { RouteContext } from "~/core/routeContext";
import MetaService from "./services/MetaService";

export type MetaManagerInitOptions = {
  syncDatabaseSchemaOnLoaded?: boolean;
};

class MetaManager implements RapidPlugin {
  #metaService: MetaService;

  #syncDatabaseSchemaOnLoaded?: boolean;

  constructor(options?: MetaManagerInitOptions) {
    if (!options) {
      options = {
        syncDatabaseSchemaOnLoaded: true,
      };
    }

    this.#syncDatabaseSchemaOnLoaded = options.syncDatabaseSchemaOnLoaded;
  }

  get code(): string {
    return "metaManager";
  }

  get description(): string {
    return null;
  }

  get extendingAbilities(): RpdServerPluginExtendingAbilities[] {
    return [];
  }

  get configurableTargets(): RpdServerPluginConfigurableTargetOptions[] {
    return [];
  }

  get configurations(): RpdConfigurationItemOptions[] {
    return [];
  }

  async registerActionHandlers(server: IRpdServer): Promise<any> {
    server.registerActionHandler(this, listMetaModels);
    server.registerActionHandler(this, listMetaRoutes);
    server.registerActionHandler(this, getMetaModelDetail);
  }

  async registerEventHandlers(server: IRpdServer): Promise<any> {
    server.registerEventHandler("entity.create", handleEntityCreateEvent.bind(this, server));
    server.registerEventHandler("entity.update", handleEntityUpdateEvent.bind(this, server));
    server.registerEventHandler("entity.delete", handleEntityDeleteEvent.bind(this, server));
  }

  async configureModels(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    const logger = server.getLogger();
    try {
      logger.info("Loading meta of models...");
      const models: RpdDataModel[] = await listDataModels(server);
      const dataDictionaries: RpdDataDictionary[] = await listDataDictionaries(server);
      server.appendApplicationConfig({ models, dataDictionaries });
    } catch (error) {
      logger.crit("Failed to load meta of models.", { error });
    }
  }

  async configureServices(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    this.#metaService = new MetaService(server);
    server.registerService("metaService", this.#metaService);
  }

  async onApplicationLoaded(server: IRpdServer, applicationConfig: RpdApplicationConfig): Promise<any> {
    if (this.#syncDatabaseSchemaOnLoaded) {
      await this.#metaService.syncDatabaseSchema(applicationConfig);
    }
  }
}

export default MetaManager;

async function handleEntityCreateEvent(server: IRpdServer, sender: RapidPlugin, payload: RpdEntityCreateEventPayload) {
  if (sender === this) {
    return;
  }

  if (payload.namespace === "meta" && payload.modelSingularCode === "model") {
    return;
    const { queryBuilder } = server;
    const model: Partial<RpdDataModel> = payload.after;
    if (model.tableName) {
      const model: RpdDataModel = payload.after;
      await server.queryDatabaseObject(`CREATE TABLE ${queryBuilder.quoteTable(model)} ();`, []);
    }
  }
}

async function handleEntityUpdateEvent(server: IRpdServer, sender: RapidPlugin, payload: RpdEntityUpdateEventPayload) {
  if (sender === this) {
    return;
  }

  if (payload.namespace === "meta" && payload.modelSingularCode === "model") {
    return;
    const { queryBuilder } = server;
    const modelChanges: Partial<RpdDataModel> = payload.changes;
    if (modelChanges.tableName) {
      const modelBefore: RpdDataModel = payload.before;
      await server.queryDatabaseObject(
        `ALTER TABLE ${queryBuilder.quoteTable(modelBefore)} RENAME TO ${queryBuilder.quoteTable(modelChanges as QuoteTableOptions)}`,
        [],
      );
    }
  }
}

async function handleEntityDeleteEvent(server: IRpdServer, sender: RapidPlugin, payload: RpdEntityDeleteEventPayload, routeContext?: RouteContext) {
  if (sender === this) {
    return;
  }

  if (payload.namespace !== "meta") {
    return;
  }

  const { queryBuilder } = server;

  if (payload.modelSingularCode === "model") {
    const deletedModel: RpdDataModel = payload.before;
    await server.queryDatabaseObject(`DROP TABLE ${queryBuilder.quoteTable(deletedModel)}`, []);
  } else if (payload.modelSingularCode === "property") {
    const deletedProperty: RpdDataModelProperty = payload.before;

    let columnNameToDrop = deletedProperty.columnName || deletedProperty.code;
    if (isRelationProperty(deletedProperty)) {
      if (deletedProperty.relation === "one") {
        columnNameToDrop = deletedProperty.targetIdColumnName || "";
      } else {
        // many relation
        return;
      }
    }

    const dataAccessor = server.getDataAccessor<RpdDataModel>({
      namespace: "meta",
      singularCode: "model",
    });
    const model = await dataAccessor.findById((deletedProperty as any).modelId, routeContext?.getDbTransactionClient());
    if (model) {
      await server.queryDatabaseObject(`ALTER TABLE ${queryBuilder.quoteTable(model)} DROP COLUMN ${queryBuilder.quoteObject(columnNameToDrop)}`, []);
    }
  }
}

function listDataModels(server: IRpdServer) {
  const entityManager = server.getEntityManager("model");
  const model = entityManager.getModel();

  const properties = getEntityPropertiesIncludingBase(server, model);
  return entityManager.findEntities({
    properties: properties.map((item) => item.code),
  });
}

function listDataDictionaries(server: IRpdServer) {
  const dataDictionaryManager = server.getEntityManager("data_dictionary");
  const model = dataDictionaryManager.getModel();

  const properties = getEntityPropertiesIncludingBase(server, model);
  return dataDictionaryManager.findEntities({
    properties: properties.map((item) => item.code),
  });
}
