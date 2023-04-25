import { HealthChecker, HealthEndpoint } from '@cloudnative/health-connect';
import { Router } from 'express';

import { createAccount, getAccounts } from './controllers/accounts';
import { login } from './controllers/authentication/login';
import { createBoard } from './controllers/boards';
import { createOrganisations } from './controllers/organisations';
import { organisationWithRole } from './lib/middlewares/associations';
import { authenticate } from './lib/middlewares/authentications';
import { errorHandler } from './lib/middlewares/error_handler';
import { OrganisationRole } from './types/repositories';

export function router(r: Router): Router {
  r.get('/health', HealthEndpoint(new HealthChecker()));
  r.post('/v1/authentication/login', login);
  // r.post('/v1/authentication/confirm');
  r.post('/v1/authentication/forgot-password/');
  r.post('/v1/authentication/forgot-password/confirm/:token');
  r.post('/v1/accounts', createAccount);

  /* Authenticated Routes */
  r.use(authenticate);
  r.get('/v1/accounts/:accountid', getAccounts);

  r.post('/v1/organisations', createOrganisations);
  // r.post('/v1/organisations/:organisationid/invites');
  // r.post('/v1/organisations/:organisationid/joins');
  r.get('/v1/organisations/:organisationid/boards');  /// list board
  r.post('/v1/organisations/:organisationid/boards', organisationWithRole(OrganisationRole.Manager), createBoard);
  // r.post('/v1/organisations/:organisationid/boards/:boardid?include=cards');

  // r.post('/v1/organisations/:organisationid/boards/:boardid/cards'); /// add cards
  r.get('/v1/organisations/:organisationid/boards/:boardid/cards');  /// list cards
  // r.get('/v1/organisations/:organisationid/boards/:boardid/cards/:cardid');
  // r.put('/v1/organisations/:organisationid/boards/:boardid/cards/:cardid/transfers/boards/:boardid');

  // handle errors
  r.use(errorHandler);

  return r;
}
