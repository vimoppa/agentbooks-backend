// import * as crypto from 'crypto';

import { Database, db } from '../lib/db';
import { DuplicateEntryError, Errors, InternalServerError } from '../lib/errors';
import { Account, AccountsRepository, PublicAccount } from '../types/accounts';

export class Accounts implements AccountsRepository {
  private readonly db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async createAccount(account: Account): Promise<PublicAccount | Errors> {
    // const signature = crypto.createHash('256')
    //   .update(account.email + account.username)
    //   .digest('hex');

    // const paccount: AccountsDBFields = {
    //   boards: null,
    //   confirmed: false,
    //   email: account.email,
    //   organisations: null,
    //   organisationsInvite: null,
    //   signature,
    //   passwordHash: account.passwordHash,
    //   username: account.username,
    //   //
    //   // updatedAt: '',
    //   // createAt: '',
    //   // deletedAt: '',
    // };


    const sql = 'INSERT INTO accounts (email, username, passwordHash) values (?, ?, ?)';

    // const response = await this.db.query<Account>(sql, [account.email, account.username, account.passwordHash]);
    const response = await this.db.transaction(sql, [account.email, account.username, account.passwordHash]);
    if (response instanceof Errors) {
      if (response instanceof DuplicateEntryError) {
        return new InternalServerError('already exists');
      }

      return new InternalServerError('something went wrong!');
    }

    // const paccount: PublicAccount = {
    //   boards: undefined,
    //   confirmed: false,
    //   email: "",
    //   id: "",
    //   organisations: undefined,
    //   organisationsInvite: undefined,
    //   username: ""
    // };

    return response as PublicAccount;
  }
}

export function NewAccountsRepository(): AccountsRepository {
  return new Accounts(db);
}

export const account = NewAccountsRepository();
