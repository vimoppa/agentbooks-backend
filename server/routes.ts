import { HealthChecker, HealthEndpoint } from '@cloudnative/health-connect';
import { Router } from 'express';

const r: Router = Router();

export default (): Router => {
  r.get('/health', HealthEndpoint(new HealthChecker()));

  r.use((req, res) => res.sendStatus(404));

  return r;
};
