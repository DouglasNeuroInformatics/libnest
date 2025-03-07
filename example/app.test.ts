import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import appContainer from './app.js';

import type { BaseEnv } from '../src/schemas/env.schema.js';
import type { CreateCatDto } from './cats/dto/create-cat.dto.js';

const env = {
  API_PORT: '5500',
  DEBUG: 'false',
  MONGO_URI: 'mongodb://localhost:27017',
  NODE_ENV: 'test',
  SECRET_KEY: '2622d72669dd194b98cffd9098b0d04b',
  VERBOSE: 'false'
} satisfies { [K in keyof BaseEnv]?: string };

describe('e2e (example)', () => {
  let app: NestExpressApplication;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(async () => {
    Object.entries(env).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
    app = await appContainer._unsafeUnwrap().createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      app.flushLogs();
    }
  });

  it('should configure the documentation', async () => {
    const response = await request(server!).get('/spec.json');
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
