import { NextFunction, Request, Response } from 'express';

import { Errors } from '../lib/errors';
import { account } from '../repository/accounts';
import { Account } from '../types/accounts';

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
    passwordHash: `bcrypt(${password})`,
  };

  const acc = await account.createAccount(request);
  if (acc instanceof Errors) {
    return next(acc);
  }

  return res.status(200).json(acc);
}
