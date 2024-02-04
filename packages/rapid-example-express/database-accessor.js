const { Pool } = require('pg');

module.exports = class databaseAccessor {
   #pool = null;
   constructor(options) {
      this.#pool = new Pool({
         host: options.host,
         port: options.port,
         database: options.database,
         user: options.user,
         password: options.password,
         max: options.maxConnections,
      });
   }

   async queryDatabaseObject(sql, params) {
      const res = await this.#pool.query(sql, params)
      return res.rows;
   }
}