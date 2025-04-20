import type { IncomingMessage, Server, ServerResponse } from 'http';

import { RuntimeException } from '@douglasneuroinformatics/libjs';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { fromAsyncThrowable } from 'neverthrow';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, vi } from 'vitest';
import type { SuiteAPI } from 'vitest';

import { configureApp } from '../../app/app.utils.js';
import { loadAppContainer, loadUserConfig } from '../../meta/load.js';

import type { TestAgent } from './types.js';

export type EndToEndContext = {
  api: TestAgent<{
    setAccessToken: (token: string) => void;
  }>;
};

export function e2e(fn: (describe: SuiteAPI<EndToEndContext>) => void): void {
  let app: NestExpressApplication;

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
    if (app) {
      await app.close();
      app.flushLogs();
    }
  });

  fn(describe as SuiteAPI<EndToEndContext>);
}
