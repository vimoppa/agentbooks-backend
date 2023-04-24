import { genSaltSync, hashSync } from 'bcrypt';
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
