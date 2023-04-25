import { NextFunction, Request, Response } from 'express';

import { Errors, STATUS_CODE } from '../lib/errors';
import { card } from '../repository/cards';
import { Card } from '../types/repositories';

interface CreateCardRequest {
  description: string;
  assigned_to?: string;
}

export async function createCard(req: Request, res: Response, next: NextFunction) {
  const { description }: CreateCardRequest = req.body;
  const accountId = String(req.authenticatedAccount.id);
  const boardId = String(req.authenticatedOrganisation.id);

  const createCard: Card = {
    description: description,
    reported_by: accountId,
    board_id: boardId,
  };

  const response = await card.createCard(createCard);
  if (response instanceof Errors) {
    return next(response);
  }

  return res.status(STATUS_CODE.CREATED).json({
    message: 'Card created',
    data: {},
  });
}
