import { Pool } from "pg";

export default class databaseAccessor {
  #pool: Pool;
  constructor(options: any) {
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
    const res = await this.#pool.query(sql, params);
    return res.rows;
  }
}
