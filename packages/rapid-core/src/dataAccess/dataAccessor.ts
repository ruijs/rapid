import * as _ from "lodash";
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

export interface IDataAccessorOptions {
  model: RpdDataModel;
  queryBuilder: QueryBuilder;
}

export default class DataAccessor<T = any> implements IRpdDataAccessor<T> {
  #model: RpdDataModel;
  #queryBuilder: QueryBuilder;
  #databaseAccessor: IDatabaseAccessor;

  constructor(options: IDataAccessorOptions) {
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
    return _.first(result);
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
    return _.first(result);
  }

  async find(options: FindEntityOptions): Promise<T[]> {
    console.debug("DataAccessor.find() with options:", options);
    const query = this.#queryBuilder.select(this.#model, options);
    return await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);
  }

  async findOne(options: FindEntityOptions): Promise<T> {
    _.set(options, "pagination.limit", 1);
    const list = await this.find(options);
    return _.first(list);
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
    return _.first(result);
  }

  async count(options: CountEntityOptions): Promise<any> {
    const query = this.#queryBuilder.count(this.#model, options);
    const result = await this.#databaseAccessor.queryDatabaseObject(query.command, query.params);

    const row = _.first(result);
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
