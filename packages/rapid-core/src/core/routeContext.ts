import { RapidRequest } from "./request";
import { RapidResponse } from "./response";
import { HttpStatus } from "./http-types";
import { IRpdServer } from "./server";
import { IDatabaseAccessor, IDatabaseClient } from "~/types";

export type Next = () => Promise<void>;

export type TransactionState = "uninited" | "inited" | "started";

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
  #dbTransactionState: TransactionState;

  static newSystemOperationContext(server: IRpdServer) {
    return new RouteContext(server);
  }

  constructor(server: IRpdServer, request?: RapidRequest) {
    this.#server = server;
    this.databaseAccessor = server.getDatabaseAccessor();
    this.#dbTransactionState = "uninited";

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

  async initDbTransactionClient(): Promise<IDatabaseClient> {
    let dbClient = this.#dbTransactionClient;
    if (dbClient) {
      return dbClient;
    }

    dbClient = await this.databaseAccessor.getClient();
    this.#dbTransactionState = "inited";
    this.#dbTransactionClient = dbClient;
    return dbClient;
  }

  async beginDbTransaction(): Promise<void> {
    if (!this.#dbTransactionClient) {
      throw new Error("Database transaction has not been inited. You should call initDbTransactionClient() first.");
    }

    if (this.#dbTransactionState === "started") {
      throw new Error("Database transaction has been started. You can not begin a new transaction before you commit or rollback it.");
    }

    await this.databaseAccessor.queryDatabaseObject("BEGIN", [], this.#dbTransactionClient);
    this.#dbTransactionState = "started";
  }

  async commitDbTransaction(): Promise<void> {
    if (!this.#dbTransactionClient) {
      throw new Error("Database transaction has not been inited. You should call initDbTransactionClient() first.");
    }

    if (this.#dbTransactionState !== "started") {
      throw new Error("Database transaction has not been started. You should call beginDbTransaction() first.");
    }

    await this.databaseAccessor.queryDatabaseObject("COMMIT", [], this.#dbTransactionClient);
    this.#dbTransactionState = "inited";
  }

  async rollbackDbTransaction(): Promise<void> {
    if (!this.#dbTransactionClient) {
      throw new Error("Database transaction has not been inited. You should call initDbTransactionClient() first.");
    }

    if (this.#dbTransactionState !== "started") {
      throw new Error("Database transaction has not been started. You should call beginDbTransaction() first.");
    }

    await this.databaseAccessor.queryDatabaseObject("ROLLBACK", [], this.#dbTransactionClient);
    this.#dbTransactionState = "inited";
  }
}
