import type { IncomingMessage, Server, ServerResponse } from 'http';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { fromAsyncThrowable } from 'neverthrow';
import request from 'supertest';
import type SupertestAgent from 'supertest/lib/agent.js';
import { afterAll, beforeAll, beforeEach, describe, vi } from 'vitest';
import type { SuiteAPI } from 'vitest';

import { configureApp } from '../../app/app.utils.js';
import { loadAppContainer, loadUserConfig } from '../../meta/load.js';
import { MONGO_CONNECTION_TOKEN } from '../../modules/prisma/prisma.config.js';

interface TestResponse {
  [key: string]: any;
  body: any;
  headers: {
    [key: string]: string;
  };
  ok: boolean;
  status: number;
  text: string;
  type: string;
}

interface TestRequest extends PromiseLike<TestResponse> {
  [key: string]: any;
  accept(type: string): this;
  method: string;
  send(data?: object | string): this;
  set(field: string, val: string): this;
  url: string;
}

interface TestAgentMethods {
  delete: (url: string) => TestRequest;
  get: (url: string) => TestRequest;
  patch: (url: string) => TestRequest;
  post: (url: string) => TestRequest;
  put: (url: string) => TestRequest;
}

// this is so we don't have to include the garbage supertest types in production
type TestAgent = SupertestAgent extends TestAgentMethods
  ? TestAgentMethods & {
      setAccessToken: (token: string) => void;
    }
  : never;

export type EndToEndContext = {
  api: TestAgent;
};

export function e2e(fn: (describe: SuiteAPI<EndToEndContext>) => void): void {
  let app: NestExpressApplication;
  let mongodb: MongoMemoryReplSet;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(async () => {
    const configFile = process.env.LIBNEST_CONFIG_FILEPATH;

    if (!configFile) {
      throw new Error(
        "Expected environment variable 'LIBNEST_CONFIG_FILEPATH' to be defined: please make sure the libnest plugin is loaded in your vitest config"
      );
    }

    const result = await loadUserConfig(
      configFile,
      fromAsyncThrowable(
        () => {
          return vi.importActual(configFile).then((exports) => exports.default);
        },
        (err) => {
          return new RuntimeException(`Failed to import config: ${configFile}`, {
            cause: err
          });
        }
      )
    ).andThen((config) => loadAppContainer(config, 'dynamic'));
    if (result.isErr()) {
      throw result.error;
    }

    const { docs, module, version } = result.value;

    mongodb = await MongoMemoryReplSet.create({
      replSet: {
        count: 1
      }
    });

    const moduleRef = await Test.createTestingModule({
      imports: [module]
    })
      .overrideProvider(MONGO_CONNECTION_TOKEN)
      .useValue(new URL('/test', mongodb.getUri()).href)
      .compile();

    app = moduleRef.createNestApplication({
      logger: false
    });

    await configureApp(app, {
      docs,
      version
    });

    await app.init();
    server = app.getHttpServer();
  });

  beforeEach<EndToEndContext>((ctx) => {
    const agent = request.agent(server);
    ctx.api = Object.assign(agent, {
      setAccessToken: (token: string) => {
        agent.set('Authorization', `Bearer ${token}`);
      }
    });
  });

  afterAll(async () => {
    await mongodb.stop();
    if (app) {
      await app.close();
      app.flushLogs();
    }
  });

  fn(describe as SuiteAPI<EndToEndContext>);
}
