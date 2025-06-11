import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { expect, suite } from 'vitest';
import type { ExpectStatic, TestAPI } from 'vitest';

import { configureApp } from '../../app/app.utils.js';

import type { AppContainer } from '../../app/app.container.js';
import type { TestAgent } from './types.js';

type EndToEndTestAgent = TestAgent<{
  setAccessToken: (token: string) => void;
}>;

type EndToEndTestFactory = (ctx: { api: EndToEndTestAgent; expect: ExpectStatic; it: TestAPI; test: TestAPI }) => void;

export function e2e(appContainer: AppContainer<any, any, any>, fn: EndToEndTestFactory): void {
  let app: NestExpressApplication;
  const api = {} as EndToEndTestAgent;

  const collector = suite('App (e2e)', (test) => fn({ api, expect, it: test, test }));

  collector.on('beforeAll', async () => {
    const { docs, module, version } = appContainer;

    const moduleRef = await Test.createTestingModule({
      imports: [module]
    }).compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    await configureApp(app, {
      docs,
      version
    });

    await app.init();
    const agent = request.agent(app.getHttpServer());
    Object.assign(agent, {
      setAccessToken: (token: string) => {
        agent.set('Authorization', `Bearer ${token}`);
      }
    });
    Object.setPrototypeOf(api, agent);
  });

  collector.on('afterAll', async () => {
    if (app) {
      await app.close();
      app.flushLogs();
    }
  });
}
