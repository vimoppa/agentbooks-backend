import { NextFunction, Request, Response } from 'express';

import { Errors, STATUS_CODE } from '../lib/errors';
import { board } from '../repository/boards';

export interface CreateBoardReq {
  slug: string;
}

export async function createBoard(req: Request, res: Response, next: NextFunction) {
  const { slug }: CreateBoardReq = req.body;
  const accountid = String(req.authenticatedAccount.id);

  const response = await board.createBoard(req.authenticatedOrganisation.id, slug, accountid);
  if (response instanceof Errors) {
    return next(response);
  }

  return res.status(STATUS_CODE.CREATED).json({
    message: 'Board created',
    data: response,
  });
}
