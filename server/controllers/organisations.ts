import { NextFunction, Request, Response } from 'express';

import { Errors, STATUS_CODE } from '../lib/errors';
import { organisation } from '../repository/organisations';

export interface CreateOrganisationReq {
  slug: string;
}

export async function createOrganisations(req: Request, res: Response, next: NextFunction) {
  const { slug }: CreateOrganisationReq = req.body;
  const account = req.authenticatedAccount;

  const org = await organisation.createOrganisation(account.id, slug);
  if (org instanceof Errors) {
    return next(org);
  }

  return res.status(STATUS_CODE.SUCCESS).json({
    message: `organisation '${slug}' created`,
    data: org,
  });
}
