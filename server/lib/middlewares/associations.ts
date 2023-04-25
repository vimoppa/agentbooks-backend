import { NextFunction, Request, Response } from 'express';

import { organisation } from '../../repository/organisations';
import { OrganisationRole } from '../../types/repositories';
import { BadRequest, Errors, Forbidden } from '../errors';
import { Logger } from '../logger';

export function organisationWithRole(role: OrganisationRole) {
  return async function(req: Request, res: Response, next: NextFunction) {
    const { organisationid } = req.params;

    req.isOrganisationAdmin = false;
    req.authenticatedOrganisation = undefined;

    const org = await organisation.findOneById(organisationid);
    if (org instanceof Errors) {
      return next(org);
    }

    if (!org?.id) {
      return next(new BadRequest('organisation doesn\'t exist'));
    }
    Logger.debug({organisationid, org});

    const accountId = String(req.authenticatedAccount.id);

    if (role === OrganisationRole.Manager) {
      if (!org.admins.some((i) => String(i.id) === accountId)) {
        return next(new Forbidden(`Unauthorized request, endpoint restricted to organisation ${role}`));
      }
      if (org.admins.some((i) => String(i.id) === accountId)) {
        req.isOrganisationAdmin = true;
      }
    }

    if (role === OrganisationRole.Member) {
      if (!org.members.some((i) => String(i.id) === accountId)) {
        return next(new Forbidden(`Unauthorized request, endpoint restricted to organisation ${role}`));
      }
    }

    req.authenticatedOrganisation = org;

    return next();
  };
}
