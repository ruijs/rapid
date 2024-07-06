/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pool } from "pg";
import type { Logger } from "winston";

export default class DatabaseAccessor {
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

  async queryDatabaseObject(sql: any, params: any) {
    this.#logger.debug("Query database object.", { sql, params });
    const res = await this.#pool.query(sql, params);
    return res.rows;
  }
}
