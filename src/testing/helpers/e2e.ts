import type { IncomingMessage, Server, ServerResponse } from 'http';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { fromAsyncThrowable } from 'neverthrow';
import request from 'supertest';
import type TestAgent from 'supertest/lib/agent.js';
import { afterAll, beforeAll, beforeEach, describe, vi } from 'vitest';
import type { SuiteAPI } from 'vitest';

import { configureApp } from '../../app/app.utils.js';
import { loadAppContainer, loadUserConfig } from '../../meta/load.js';
import { resolveUserConfig } from '../../meta/resolve.js';
import { PRISMA_CLIENT_TOKEN } from '../../modules/prisma/prisma.config.js';
import { PrismaFactory } from '../../modules/prisma/prisma.factory.js';

export type EndToEndContext = {
  api: TestAgent;
};

export function e2e(fn: (it: SuiteAPI<EndToEndContext>) => void): void {
  let app: NestExpressApplication;
  let mongodb: MongoMemoryServer;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(async () => {
    const result = await resolveUserConfig(process.env.LIBNEST_APP_BASE_DIR ?? import.meta.dirname)
      .asyncAndThen((configFile) =>
        loadUserConfig(
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
        )
      )
      .andThen((config) => loadAppContainer(config, 'dynamic'));
    if (result.isErr()) {
      throw result.error;
    }

    const { docs, module, version } = result.value;

    mongodb = await MongoMemoryServer.create();

    const moduleRef = await Test.createTestingModule({
      imports: [module]
    })
      .overrideProvider(PRISMA_CLIENT_TOKEN)
      .useFactory({
        factory: (prismaFactory: PrismaFactory) => {
          return prismaFactory.instantiateExtendedClient({
            datasourceUrl: new URL('/test', mongodb.getUri()).href
          });
        },
        inject: [PrismaFactory]
      })
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
    ctx.api = request(server);
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
