import { NextFunction, Request, Response } from 'express';
import { get, has } from 'lodash';

import { account } from '../../repository/accounts';
import { BadRequest, Errors, Forbidden } from '../errors';
import { decodeToken, verifyToken } from '../jwt';

const AUTHORIZATION = 'authorization';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  if (!has(req.headers, AUTHORIZATION)) {
    return next(new Forbidden('Authentication required'));
  }

  req.authenticatedAccount = undefined;
  req.isSysAdmin = false;

  const header = get(req.headers, AUTHORIZATION);
  const parts = header.split(' ');
  const scheme = parts[0];
  const token = parts[1];
  if (!/^Bearer$/i.test(scheme) || !token) {
    return next(new BadRequest('Format is Authorization: Bearer [token]'));
  }
  const decoded = decodeToken(token);
  if (decoded === null) {
    return next(new BadRequest('Malformed authentication token'));
  }

  const authenticatedAccount = await account.findOneById(decoded.payload.sub as any);
  if (authenticatedAccount instanceof Errors) {
    return next(authenticatedAccount);
  }

  // console.log(token, decoded, authenticatedAccount.signature);

  const verified = await verifyToken(token, authenticatedAccount.signature);
  if (verified instanceof Errors) {
    return next(verified);
  }

  // TODO: update last_logged_in
  // TODO: validated token scope for access and refresh tokens
  req.authenticatedAccount = authenticatedAccount;
  req.authenticatedAccount.id = String(authenticatedAccount.id); // TODO: use mysql.uuid()
  req.isSysAdmin = false; // TODO: should be verified by account role and permission.

  return next();
}
