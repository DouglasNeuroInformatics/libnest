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
  let server!: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(async () => {
    Object.entries(env).forEach(([key, value]) => {
      vi.stubEnv(key, value);
    });
    app = appContainer.getApplicationInstance();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      app.flushLogs();
    }
  });

  describe('/spec.json', () => {
    it('should configure the documentation', async () => {
      const response = await request(server).get('/spec.json');
      expect(response.status).toBe(200);
    });
  });

  // describe('/auth/login', () => {
  //   it('should return status code 400 if the request body does not include login credentials', async () => {
  //     const response = await request(server).post('/v1/auth/login');
  //     expect(response.status).toBe(400);
  //   });
  //   it('should return status code 400 if the request body does not include a username', async () => {
  //     const response = await request(server).post('/v1/auth/login').send({ username: 'admin' });
  //     expect(response.status).toBe(400);
  //   });
  //   it('should return status code 400 if the request body does not include a password', async () => {
  //     const response = await request(server).post('/v1/auth/login').send({ password: 'password' });
  //     expect(response.status).toBe(400);
  //   });
  //   it('should return status code 400 if the request body includes a username and password, but are empty strings', async () => {
  //     const response = await request(server).post('/v1/auth/login').send({ password: '', username: '' });
  //     expect(response.status).toBe(400);
  //   });
  //   it('should return status code 400 if the request body includes a username and password, but password is a number', async () => {
  //     const response = await request(server).post('/v1/auth/login').send({ password: 123, username: 'admin' });
  //     expect(response.status).toBe(400);
  //   });
  //   it('should return status code 401 if the user does not exist', async () => {
  //     const response = await request(server).post('/v1/auth/login').send({ password: 'password', username: 'user' });
  //     expect(response.status).toBe(401);
  //   });
  // });

  describe('/cats', () => {
    it('should allow a GET request', async () => {
      const response = await request(server).get('/v1/cats');
      expect(response.status).toBe(200);
    });

    it('should allow a POST request', async () => {
      const response = await request(server)
        .post('/v1/cats')
        .send({
          age: 1,
          name: 'Winston'
        } satisfies CreateCatDto);
      expect(response.status).toBe(201);
    });
  });
});
