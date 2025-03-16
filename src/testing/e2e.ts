import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent.js';
import { test } from 'vitest';

import { findConfig, loadAppContainer, loadConfig } from '../utils/meta.utils.js';

export type EndToEndFixtures = {
  api: TestAgent;
  app: NestExpressApplication;
};

export const e2e = test.extend<EndToEndFixtures>({
  api: [
    async ({ app }, use): Promise<void> => {
      const server = app.getHttpServer();
      await use(request(server));
    }
  ],
  app: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use): Promise<void> => {
      await findConfig(import.meta.dirname)
        .asyncAndThen(loadConfig)
        .andThen(loadAppContainer)
        .match(
          async (appContainer) => {
            const app = appContainer.getApplicationInstance();
            await app.init();
            await use(app);
            await app.close();
            app.flushLogs();
          },
          (err) => {
            throw err;
          }
        );
    }
  ]
});
