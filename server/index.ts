import express from 'express';
import * as http from 'http';
import os from 'os';

import { db } from './lib/db';
import { expressLib } from './lib/express';
import { router } from './routes';

async function srv() {
  // establish connection with database and ping!.
  await db.ping();
  const host = os.hostname();
  const port = '3000';

  const app = express();
  await expressLib(app);
  await router(app);

  const server = http.createServer(app);

  server.on('error', (err: Error): void => {
    console.error(err);
    process.exit(1);
  });

  server.listen(port, (): void => {
    console.log(`API listening at http://${host}:${port}`);
  });
}

srv();
