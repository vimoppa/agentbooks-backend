import { HealthChecker, HealthEndpoint } from '@cloudnative/health-connect';
import { Router } from 'express';

import { createAccount } from './controllers/accounts';

export function router(r: Router): Router {
  r.get('/health', HealthEndpoint(new HealthChecker()));

  // accounts endpoints
  r.post('/v1/accounts', createAccount);

  // handle errors
  r.use((err, req, res, next) => res.status(Number(err.code)).json({ error: err }));

  return r;
}
