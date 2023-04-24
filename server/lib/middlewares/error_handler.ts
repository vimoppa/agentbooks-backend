import { NextFunction, Request, Response } from 'express';

import { Errors } from '../errors';
import { Logger } from '../logger';


export function errorHandler(err: Errors, req: Request, res: Response, next: NextFunction) {
  if (res.headersSent) {
    return next(err);
  }

  res.header('Cache-Control', 'no-cache');

  try {
    if (!err.code || !Number.isInteger(err.code)) {
      err.code = Number((err as any)?.status);
    }
  } catch (e) {
    Logger.error(e);
  }

  res.status(Number(err.code)).json({ err });
}
