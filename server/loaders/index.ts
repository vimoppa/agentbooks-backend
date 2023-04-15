import { Express } from 'express';

import express from './express';

export default async ({ app }: { app: Express }): Promise<void> => {
  await express({ app });
};
