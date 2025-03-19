import type { IncomingMessage, Server, ServerResponse } from 'http';

import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent.js';
import { afterAll, beforeAll, beforeEach, describe } from 'vitest';
import type { SuiteAPI } from 'vitest';

export type EndToEndContext = {
  api: TestAgent;
};

export function e2e(fn: (it: SuiteAPI<EndToEndContext>) => void): void {
  let app: NestExpressApplication;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(async () => {
    const { loadAppContainer, loadUserConfig } = await import('../../meta/load.js');
    const { resolveUserConfig } = await import('../../meta/resolve.js');
    const result = await resolveUserConfig(import.meta.dirname)
      .asyncAndThen(loadUserConfig)
      .andThen((config) => loadAppContainer(config, 'dynamic'));
    if (result.isErr()) {
      throw result.error;
    }
    app = result.value.getApplicationInstance();
    await app.init();
    server = app.getHttpServer();
  });

  beforeEach<EndToEndContext>((ctx) => {
    ctx.api = request(server);
  });

  afterAll(async () => {
    await app.close();
    app.flushLogs();
  });

  fn(describe as SuiteAPI<EndToEndContext>);
}
