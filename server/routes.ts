import { HealthChecker, HealthEndpoint } from '@cloudnative/health-connect';
import { Router } from 'express';
import * as fs from 'fs';
import swaggerUI from 'swagger-ui-express';
import YAML from 'yaml';

import { createAccount, getAccounts } from './controllers/accounts';
import { login } from './controllers/authentication/login';
import { createBoard } from './controllers/boards';
import { createCard } from './controllers/cards';
import { createOrganisations } from './controllers/organisations';
import { boardWithRole, organisationWithRole } from './lib/middlewares/associations';
import { authenticate } from './lib/middlewares/authentications';
import { errorHandler } from './lib/middlewares/error_handler';
import { BoardPermission, OrganisationRole } from './types/repositories';

const apidocs = fs.readFileSync('apidocs.yaml', 'utf8');
const swaggerdocs = YAML.parse(apidocs);

export function router(r: Router): Router {
  r.get('/', swaggerUI.serve, swaggerUI.setup(swaggerdocs, { explorer: true }));
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

  r.post('/v1/organisations/:organisationid/boards/:boardid/cards', organisationWithRole(OrganisationRole.Manager), boardWithRole(BoardPermission.Owner), createCard); /// add cards
  // r.get('/v1/organisations/:organisationid/boards/:boardid/cards');
  // r.get('/v1/organisations/:organisationid/boards/:boardid/cards/:cardid');
  // r.put('/v1/organisations/:organisationid/boards/:boardid/cards/:cardid/transfers/boards/:boardid');

  // handle errors
  r.use(errorHandler);

  return r;
}
