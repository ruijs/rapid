import { CreateEntityOptions, IRpdDataAccessor, RpdDataModel, IDatabaseAccessor, DatabaseQuery, IDatabaseClient } from "~/types";
import QueryBuilder from "~/queryBuilder/queryBuilder";
import { first, set } from "lodash";
import { IRpdServer } from "~/core/server";
import { Logger } from "~/facilities/log/LogFacility";
import { newDatabaseError } from "~/utilities/errorUtility";
import { CountRowOptions, FindRowOptions, UpdateRowOptions } from "./dataAccessTypes";

export interface IDataAccessorOptions {
  model: RpdDataModel;
  queryBuilder: QueryBuilder;
}

export default class DataAccessor<T = any> implements IRpdDataAccessor<T> {
  #logger: Logger;
  #model: RpdDataModel;
  #queryBuilder: QueryBuilder;
  #server: IRpdServer;
  #databaseAccessor: IDatabaseAccessor;

  constructor(server: IRpdServer, databaseAccessor: IDatabaseAccessor, options: IDataAccessorOptions) {
    this.#server = server;
    this.#logger = server.getLogger();
    this.#databaseAccessor = databaseAccessor;
    this.#queryBuilder = options.queryBuilder;
    this.#model = options.model;
  }

  getModel() {
    return this.#model;
  }

  async create(entity: Partial<T>, databaseClient: IDatabaseClient | null): Promise<T> {
    const options: CreateEntityOptions = {
      entity,
    };
    const query = this.#queryBuilder.insert(this.#model, options);
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params, databaseClient);
    return first(result);
  }

  async updateById(id: any, entity: Partial<T>, databaseClient: IDatabaseClient | null): Promise<{ count: number }> {
    const options: UpdateRowOptions = {
      entity,
      filters: [
        {
          field: {
            name: "id",
          },
          operator: "eq",
          value: id,
        },
      ],
    };
    const query = this.#queryBuilder.update(this.#model, options);
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params, databaseClient);
    return first(result);
  }

  async find(options: FindRowOptions, databaseClient: IDatabaseClient | null): Promise<T[]> {
    this.#logger.debug(`Finding '${this.#model.singularCode}' entity.`, { options });
    let query: DatabaseQuery;
    if (this.#model.base) {
      const baseModel = this.#server.getModel({
        singularCode: this.#model.base,
      });
      query = this.#queryBuilder.selectDerived(this.#model, baseModel, options);
    } else {
      query = this.#queryBuilder.select(this.#model, options);
    }

    try {
      return await this.#databaseAccessor.queryDatabaseObject(query.command, query.params, databaseClient);
    } catch (err) {
      throw newDatabaseError(`Failed to find entities. ${err.message}`, err);
    }
  }

  async findOne(options: FindRowOptions, databaseClient: IDatabaseClient | null): Promise<T> {
    set(options, "pagination.limit", 1);
    const list = await this.find(options, databaseClient);
    return first(list);
  }

  async findById(id: any, databaseClient: IDatabaseClient | null): Promise<T | null> {
    const options: FindRowOptions = {
      filters: [
        {
          field: {
            name: "id",
          },
          operator: "eq",
          value: id,
        },
      ],
    };
    const result = await this.findOne(options, databaseClient);
    return result;
  }

  async count(options: CountRowOptions, databaseClient: IDatabaseClient | null): Promise<number> {
    let query: DatabaseQuery;
    if (this.#model.base) {
      const baseModel = this.#server.getModel({
        singularCode: this.#model.base,
      });
      query = this.#queryBuilder.countDerived(this.#model, baseModel, options);
    } else {
      query = this.#queryBuilder.count(this.#model, options);
    }
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params, databaseClient);

    const row = first(result);
    if (row) {
      return row.count;
    }
    return 0;
  }

  async deleteById(id: any, databaseClient: IDatabaseClient | null) {
    const options: FindRowOptions = {
      filters: [
        {
          field: {
            name: "id",
          },
          operator: "eq",
          value: id,
        },
      ],
    };
    const query = this.#queryBuilder.delete(this.#model, options);
    await this.#databaseAccessor.queryDatabaseObject(query.command, query.params, databaseClient);
  }
}
