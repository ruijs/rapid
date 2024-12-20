import { isArray, isObject } from "lodash";
import { RapidRequest } from "./request";
import { RapidResponse } from "./response";
import { HttpStatus, ResponseData } from "./http-types";
import { IRpdServer } from "./server";
import { Logger } from "~/facilities/log/LogFacility";
import { IDatabaseAccessor, IDatabaseClient } from "~/types";

export type Next = () => Promise<void>;

// TODO: should divide to RequestContext and OperationContext

export class RouteContext {
  readonly request: RapidRequest;
  readonly response: RapidResponse;
  readonly state: Record<string, any>;
  readonly databaseAccessor: IDatabaseAccessor;
  method: string;
  path: string;
  params: Record<string, string>;
  routeConfig: any;
  #server: IRpdServer;
  #dbTransactionClient: IDatabaseClient | undefined;

  static newSystemOperationContext(server: IRpdServer) {
    return new RouteContext(server);
  }

  constructor(server: IRpdServer, request?: RapidRequest) {
    this.#server = server;
    this.databaseAccessor = server.getDatabaseAccessor();
    this.request = request;
    this.state = {};
    this.response = new RapidResponse();

    // `method` and `path` are used by `koa-tree-router` to match route
    if (this.request) {
      this.method = request.method;
      this.path = request.url.pathname;
    }
  }

  clone(): RouteContext {
    const clonedContext = new RouteContext(this.#server);
    clonedContext.method = this.method;
    clonedContext.path = this.path;
    clonedContext.params = this.params;
    clonedContext.setState(this.state);

    return clonedContext;
  }

  setState(state: Record<string, any>) {
    Object.assign(this.state, state);
  }

  // `koa-tree-router` uses this method to set headers
  set(headerName: string, headerValue: string) {
    this.response.headers.set(headerName, headerValue);
  }

  json(obj: any, status?: HttpStatus, headers?: HeadersInit) {
    this.response.json(obj, status, headers);
  }

  redirect(url: string, status?: HttpStatus) {
    this.response.redirect(url, status);
  }

  getDbTransactionClient(): IDatabaseClient | undefined {
    return this.#dbTransactionClient;
  }

  async beginDbTransaction(): Promise<IDatabaseClient> {
    let dbClient = this.#dbTransactionClient;
    if (dbClient) {
      throw new Error("Database transaction has been started. You can not start a transaction more than once in a request context.");
    }

    dbClient = await this.databaseAccessor.getClient();
    await this.databaseAccessor.queryDatabaseObject("BEGIN", [], dbClient);
    this.#dbTransactionClient = dbClient;
    return dbClient;
  }

  async commitDbTransaction(): Promise<void> {
    if (!this.#dbTransactionClient) {
      throw new Error("Database transaction has not been started. You should call beginDbTransaction() first.");
    }
    await this.databaseAccessor.queryDatabaseObject("COMMIT", [], this.#dbTransactionClient);
  }

  async rollbackDbTransaction(): Promise<void> {
    if (!this.#dbTransactionClient) {
      throw new Error("Database transaction has not been started. You should call beginDbTransaction() first.");
    }
    await this.databaseAccessor.queryDatabaseObject("ROLLBACK", [], this.#dbTransactionClient);
  }
}
