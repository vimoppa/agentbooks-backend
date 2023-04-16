import cors from 'cors';
import express from 'express';
import helmet from 'helmet';

export function expressLib(app: express.Application) {
  app.enable('trust proxy');

  app.use(helmet());

  app.use(cors());

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));
}
