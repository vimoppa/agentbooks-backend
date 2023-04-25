import mysql from 'mysql';

import { DatabaseConnectionError, DatabaseOperationError, DuplicateEntryError, Errors } from './errors';
import { Logger } from './logger';

const dbconfig: mysql.PoolConfig = {
  connectionLimit: 1000,
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'agentbooks',
  insecureAuth: true,
  // debug: true,
};

export class Database {
  private readonly _pool: mysql.Pool;

  constructor() {
    this._pool = mysql.createPool(dbconfig);
  }

  get pool() {
    return this._pool;
  }

  async ping(): Promise<null | DatabaseConnectionError> {
    return new Promise((resolve, reject) => {
      return this._pool.getConnection((e, connection) => {
        if (e) return reject(new DatabaseConnectionError(e.message));

        return connection.ping(err => {
          connection.release();

          if (err) {
            Logger.error(err);
            return reject(new DatabaseConnectionError(err.message));
          }

          Logger.debug('database connection established!');
          return resolve(null);
        });
      });
    });
  }

  async query<T extends object>(sql: string, values?: any): Promise<T | DatabaseOperationError> {
    return new Promise((resolve, reject) => {
      this._pool.query(sql, values, (e, results) => {
        if (e) return reject(new DatabaseConnectionError(e.message));
        return resolve(results);
      });
    });
  }

  private async _connection(): Promise<mysql.PoolConnection | mysql.MysqlError> {
    return new Promise((resolve, reject) => {
      this._pool.getConnection((e, connection) => {
        if (e) reject(e);
        resolve(connection);
      });
    });
  }

  private async _txQuery<T extends object>(
    connection: mysql.PoolConnection,
    sql: string,
    values?: any,
  ): Promise<T | null> {
    Logger.debug(`Database.Transaction >>> ${sql}`);
    return new Promise((resolve, reject) => {
      return connection.query(sql, values, (e, results) => {
        if (e) reject(e);
        resolve(results);
      });
    });
  }

  async transaction<T extends object>(
    sql,
    values,
    fn?: (connection: mysql.PoolConnection) => void,
  ): Promise<T | Errors> {
    const connection = await this._connection();
    if (connection instanceof Error) {
      return new DatabaseConnectionError(connection.message);
    }

    try {
      await this._txQuery(connection, 'START TRANSACTION');
      await this._txQuery(connection, sql, values);

      if (fn !== undefined && typeof fn === 'function') {
        await fn(connection);
      }

      return await this._txQuery<T>(connection, 'COMMIT');
    } catch (e) {
      if (e.code === 'ER_DUP_ENTRY') {
        return new DuplicateEntryError(e);
      }

      await this._txQuery(connection, 'ROLLBACK');
      return new DatabaseOperationError(e.message);
    } finally {
      connection.release();
    }
  }
}

export const db = new Database();
