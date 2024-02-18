import {
  CountEntityOptions,
  FindEntityOptions,
  CreateEntityOptions,
  IRpdDataAccessor,
  RpdDataModel,
  UpdateEntityOptions,
  IDatabaseAccessor,
} from "~/types";
import QueryBuilder from "~/queryBuilder/queryBuilder";
import { first, set } from "lodash";
import { IRpdServer } from "~/core/server";
import { Logger } from "~/facilities/log/LogFacility";

export interface IDataAccessorOptions {
  model: RpdDataModel;
  queryBuilder: QueryBuilder;
}

export default class DataAccessor<T = any> implements IRpdDataAccessor<T> {
  #logger: Logger;
  #model: RpdDataModel;
  #queryBuilder: QueryBuilder;
  #databaseAccessor: IDatabaseAccessor;

  constructor(server: IRpdServer, databaseAccessor: IDatabaseAccessor, options: IDataAccessorOptions) {
    this.#logger = server.getLogger();
    this.#databaseAccessor = databaseAccessor;
    this.#queryBuilder = options.queryBuilder;
    this.#model = options.model;
  }

  getModel() {
    return this.#model;
  }

  async create(entity: Partial<T>): Promise<T> {
    const options: CreateEntityOptions = {
      entity,
    };
    const query = this.#queryBuilder.insert(this.#model, options);
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);
    return first(result);
  }

  async updateById(id: any, entity: Partial<T>): Promise<{ count: number }> {
    const options: UpdateEntityOptions = {
      entity,
      filters: [
        {
          field: "id",
          operator: "eq",
          value: id,
        },
      ],
    };
    const query = this.#queryBuilder.update(this.#model, options);
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);
    return first(result);
  }

  async find(options: FindEntityOptions): Promise<T[]> {
    this.#logger.debug(`Finding '${this.#model.singularCode}' entity.`, { options });
    const query = this.#queryBuilder.select(this.#model, options);
    return await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);
  }

  async findOne(options: FindEntityOptions): Promise<T> {
    set(options, "pagination.limit", 1);
    const list = await this.find(options);
    return first(list);
  }

  async findById(id: any): Promise<T | null> {
    const options: FindEntityOptions = {
      filters: [
        {
          field: "id",
          operator: "eq",
          value: id,
        },
      ],
    };
    const query = this.#queryBuilder.select(this.#model, options);
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);
    return first(result);
  }

  async count(options: CountEntityOptions): Promise<any> {
    const query = this.#queryBuilder.count(this.#model, options);
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);

    const row = first(result);
    if (row) {
      return row;
    }
    return {
      count: 0,
    };
  }

  async deleteById(id: any) {
    const options: FindEntityOptions = {
      filters: [
        {
          field: "id",
          operator: "eq",
          value: id,
        },
      ],
    };
    const query = this.#queryBuilder.delete(this.#model, options);
    await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);
  }
}
