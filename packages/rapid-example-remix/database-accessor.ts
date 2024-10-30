/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDatabaseAccessor, IDatabaseClient } from "@ruiapp/rapid-core";
import { Pool, PoolClient, QueryArrayResult } from "pg";
import type { Logger } from "winston";

export default class DatabaseAccessor implements IDatabaseAccessor {
  #logger: Logger;
  #pool: Pool;

  constructor(logger: Logger, options: any) {
    this.#logger = logger;

    this.#pool = new Pool({
      host: options.host,
      port: options.port,
      database: options.database,
      user: options.user,
      password: options.password,
      max: options.maxConnections,
    });
  }

  getClient(): Promise<IDatabaseClient> {
    return this.#pool.connect();
  }

  async queryDatabaseObject(sql: any, params?: any, client?: IDatabaseClient) {
    this.#logger.debug("Query database object.", { sql, params });
    let res: QueryArrayResult<any[]>;
    if (client) {
      res = await client.query(sql, params);
    } else {
      res = await this.#pool.query(sql, params);
    }
    return res.rows;
  }
}
