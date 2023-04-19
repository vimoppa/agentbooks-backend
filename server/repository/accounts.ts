import * as crypto from 'crypto';

import { Database, db } from '../lib/db';
import { DuplicateEntryError, Errors, InternalServerError } from '../lib/errors';
import { Account, AccountsRepository, PublicAccount } from '../types/accounts';

export class Accounts implements AccountsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createAccount(account: Account): Promise<PublicAccount | Errors> {
    const signature = crypto.createHash('SHA256')
      .update(account.email + account.username)
      .digest('hex');

    let publicAccount: PublicAccount;

    const sql = 'INSERT INTO accounts (email, username, signature, password_hash) values (?, ?, ?, ?)';
    const response = await this.db.transaction(sql, [account.email, account.username, signature, account.passwordHash], (connection) => {
      connection.query('SELECT email, username, first_name, last_name, confirmed, created_at, updated_at FROM accounts WHERE email = ?', [account.email], (e, resuls) => {
        if (e) throw e;
        publicAccount = resuls[0];
      });
    });
    if (response instanceof Errors) {
      if (response instanceof DuplicateEntryError) {
        return new InternalServerError('already exists');
      }

      return new InternalServerError('something went wrong!');
    }

    return {
      ...publicAccount,
      confirmed: Boolean(publicAccount.confirmed)
    };
  }
}

export function NewAccountsRepository(): AccountsRepository {
  return new Accounts(db);
}

export const account = NewAccountsRepository();
