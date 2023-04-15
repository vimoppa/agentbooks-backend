import express from 'express';
import * as http from 'http';
import os from 'os';

import loaders from './loaders';

async function srv() {
  const host = os.hostname();
  const port = '3000';

  const app = express();
  await loaders({ app });

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
