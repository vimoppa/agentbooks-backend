import * as crypto from 'crypto';

import { Database, db } from '../lib/db';
import { BadRequest, DuplicateEntryError, Errors, InternalServerError } from '../lib/errors';
import { createToken, TOKEN_EXPIRATION_SESSION } from '../lib/jwt';
import {
  AccessToken,
  Account,
  AccountsDBFields,
  AccountsRepository,
  PublicAccount,
} from '../types/accounts';

export class Accounts implements AccountsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createAccount(account: Account): Promise<PublicAccount | Errors> {
    const signature = crypto
      .createHash('SHA256')
      .update(account.email + account.username)
      .digest('hex');

    let publicAccount: PublicAccount;

    const sql = 'INSERT INTO accounts (email, username, signature, password_hash) values (?, ?, ?, ?)';
    const response = await this.db.transaction(
      sql,
      [account.email, account.username, signature, account.password_hash],
      connection => {
        connection.query(
          'SELECT email, username, first_name, last_name, confirmed, created_at, updated_at FROM accounts WHERE email = ?',
          [account.email],
          (e, resuls) => {
            if (e) throw e;
            publicAccount = resuls[0];
          },
        );
      },
    );
    if (response instanceof Errors) {
      if (response instanceof DuplicateEntryError) {
        return new InternalServerError('already exists');
      }

      return new InternalServerError('something went wrong!');
    }

    return {
      ...publicAccount,
      confirmed: Boolean(publicAccount.confirmed),
    };
  }

  async exists(usernameOrEmail): Promise<string | Errors> {
    const sql = 'SELECT id FROM accounts WHERE username = ? OR email = ?';
    const response: Array<object> | Errors = await this.db.query(sql, [usernameOrEmail, usernameOrEmail]);
    if (response instanceof Errors) {
      return new InternalServerError(response.message);
    }

    if (!response && !response.length) {
      return new BadRequest('account with username or email doesn\'t exist');
    }

    const account = response[0] as { id: string };
    return account.id;
  }

  async findOneById(id): Promise<AccountsDBFields | Errors> {
    const sql = 'SELECT * FROM accounts WHERE id = ?';
    const response: Array<object> | Errors = await this.db.query(sql, [id]);
    if (response instanceof Errors) {
      return new InternalServerError(response.message);
    }

    if (!response && !response.length) {
      return new BadRequest('account with username or email doesn\'t exist');
    }

    const account = response[0] as AccountsDBFields;
    return { ...account, confirmed: Boolean(account) };
  }

  generateAccessToken(id: string, signature: string): AccessToken {
    return {
      access_token: createToken(id, signature, TOKEN_EXPIRATION_SESSION),
      ttl: TOKEN_EXPIRATION_SESSION,
    };
  }
}

export function NewAccountsRepository(): AccountsRepository {
  return new Accounts(db);
}

export const account = NewAccountsRepository();
