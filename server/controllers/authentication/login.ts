import { compareSync } from 'bcrypt';
import { NextFunction, Request, Response } from 'express';

import { BadRequest, Errors, STATUS_CODE } from '../../lib/errors';
import { Logger } from '../../lib/logger';
import { account } from '../../repository/accounts';

// const expectedLoginDataItem = ['usernameOrEmail', 'password']

export async function login(req: Request, res: Response, next: NextFunction) {
  const { usernameOrEmail, password } = req.body;

  const exists = await account.exists(usernameOrEmail);
  if (exists instanceof Errors) {
    return next(exists);
  }

  const response = await account.findOneById(exists);
  if (response instanceof Errors) {
    return next(response);
  }

  Logger.debug(response);
  if (!compareSync(password, response.password_hash)) {
    return next(new BadRequest('incorrect credentials'));
  }
  // if (!response.confirmed) {
  //   account.generateAndSendConfirmation(response.id, response.email, 'email');
  //   return res.status(STATUS_CODE.CONFLICT).json({
  //     message: 'account not confirmed, confirmation code has been sent to your email.'
  //   });
  // }

  return res.status(STATUS_CODE.SUCCESS).json({
    token: account.generateAccessToken(response.id, response.signature),
  });
}
