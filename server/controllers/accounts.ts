import { genSaltSync, hashSync } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';
import { pick } from 'lodash';

import { Errors, Forbidden, STATUS_CODE } from '../lib/errors';
import { Logger } from '../lib/logger';
import { account } from '../repository/accounts';
import { Account } from '../types/repositories';

// const expectedCreateAccountData = ['email', 'password'];

export interface CreateAccountReq {
  email: string;
  password: string;
  username?: string;
}

export async function createAccount(req: Request, res: Response, next: NextFunction) {
  const { email, password, username }: CreateAccountReq = req.body;

  const request: Account = {
    email,
    username,
    password_hash: hashSync(password, genSaltSync(10)),
  };

  const acc = await account.createAccount(request);
  if (acc instanceof Errors) {
    return next(acc);
  }

  return res.status(STATUS_CODE.SUCCESS).json({
    message: 'account created, confirmation code has been sent to your email',
    data: acc,
  });
}

export async function getAccounts(req: Request, res: Response, next: NextFunction) {
  const { accountid } = req.params;

  Logger.debug({ id: req.authenticatedAccount.id, accountid: Number(accountid) });
  // only system admins can fetch any accounts resource
  if (req.authenticatedAccount.id !== accountid && !req.isSysAdmin) {
    return new Forbidden('Unauthorized');
  }

  if (req.authenticatedAccount.id !== accountid) {
    const response = await account.findOneById(accountid as string);
    if (response instanceof Errors) {
      return next(response);
    }
  }

  return res.status(STATUS_CODE.SUCCESS).json({
    message: 'account resource',
    data: pick(req.authenticatedAccount, ['id', 'email', 'username', 'first_name', 'last_name', 'confirmed']),
  });
}
