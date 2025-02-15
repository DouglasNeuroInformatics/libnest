import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { $BaseRuntimeConfig } from '../../../config/schema.js';
import { AppFactory } from '../app.factory.js';
import { CatsModule } from './stubs/cats.module.js';

import type { RuntimeConfig } from '../../../config/schema.js';
import type { CreateAppOptions } from '../app.factory.js';
import type { CreateCatDto } from './stubs/dto/create-cat.dto.js';

const env = {
  API_DEV_SERVER_PORT: '5500',
  DEBUG: 'false',
  MONGO_URI: 'mongodb://localhost:27017',
  NODE_ENV: 'test',
  SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
  VERBOSE: 'false'
} satisfies { [K in keyof RuntimeConfig]?: string };

describe('AppFactory.createApp', () => {
  const createApp = (options?: Partial<CreateAppOptions>) => {
    return AppFactory.createApp({
      callback: vi.fn(),
      imports: [CatsModule],
      schema: $BaseRuntimeConfig,
      version: '1',
      ...options
    });
  };

  beforeAll(() => {
    Object.entries(env).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
  });

  describe('configuration', () => {
    it('should throw an error if it cannot parse the schema', async () => {
      vi.stubEnv('VERBOSE', '1');
      await expect(createApp()).rejects.toThrow('Failed to Parse Environment Variables');
      vi.stubEnv('VERBOSE', env.VERBOSE);
    });
  });

  describe('integration', () => {
    let app: NestExpressApplication;
    let server: Server<typeof IncomingMessage, typeof ServerResponse>;

    beforeAll(async () => {
      await createApp({
        callback: async (_app) => {
          app = _app;
          await app.init();
          server = app.getHttpServer();
        },
        docs: {
          config: {
            title: 'Test API'
          },
          path: '/api-docs.json'
        }
      });
    });

    afterAll(async () => {
      if (app) {
        await app.close();
        app.flushLogs();
      }
    });

    it('should configure the documentation', async () => {
      const response = await request(server!).get('/api-docs.json');
      expect(response.status).toBe(200);
    });

    it('should allow a GET request', async () => {
      const response = await request(server!).get('/v1/cats');
      expect(response.status).toBe(200);
    });

    it('should allow a POST request', async () => {
      const response = await request(server!)
        .post('/v1/cats')
        .send({
          age: 1,
          name: 'Winston'
        } satisfies CreateCatDto);
      expect(response.status).toBe(201);
    });
  });
});
