import { Module } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, beforeAll, expect, suite } from 'vitest';
import type { ExpectStatic, TestAPI } from 'vitest';

import { configureApp } from '../../app/app.utils.js';

import type { ImportedModule } from '../../app/app.base.js';
import type { TestAgent } from './types.js';

type IntegrationTestFactory = (ctx: { api: TestAgent; expect: ExpectStatic; it: TestAPI; test: TestAPI }) => void;

type IntegrationTestSuite = {
  api: TestAgent;
  describe: (name: string, fn: IntegrationTestFactory) => void;
};

@Module({})
export class IntegrationTestModule {
  static async for(module: ImportedModule): Promise<TestingModule> {
    const { AppFactory } = await import('../../app/app.factory.js');
    return Test.createTestingModule({
      imports: [
        AppFactory.createModule({
          envConfig: {
            API_PORT: null!,
            MONGO_URI: null!,
            NODE_ENV: 'test',
            SECRET_KEY: '12345',
            THROTTLER_ENABLED: false
          },
          imports: [module],
          prisma: {
            dbPrefix: null,
            useInMemoryDbForTesting: true
          }
        })
      ]
    }).compile();
  }
}

export function createIntegrationTestSuite(module: ImportedModule): IntegrationTestSuite {
  let api: TestAgent;

  const describe = (name: string, fn: IntegrationTestFactory): void => {
    suite(name, (test) => {
      let app: NestExpressApplication;

      beforeAll(async () => {
        const moduleRef = await IntegrationTestModule.for(module);
        app = moduleRef.createNestApplication({
          logger: false
        });

        await configureApp(app);
        await app.init();
        api = request.agent(app.getHttpServer());
      });

      afterAll(async () => {
        if (app) {
          await app.close();
          app.flushLogs();
        }
      });

      fn({ api, expect, it: test, test });
    });
  };

  return {
    api: api!,
    describe
  };
}
