import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { z } from 'zod';

import { ConfigModule } from '../../config/config.module.js';
import { CryptoModule } from '../../crypto/crypto.module.js';
import { CryptoService } from '../../crypto/crypto.service.js';
import { LoggingModule } from '../../logging/logging.module.js';
import { AuthModule } from '../auth.module.js';

import type { BaseEnv } from '../../../schemas/env.schema.js';

describe('AuthModule', () => {
  let app: NestExpressApplication;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  let userQuery: Mock;

  const loginCredentials = {
    password: 'password',
    username: 'admin'
  };

  let hashedPassword: string;

  beforeAll(async () => {
    userQuery = vi.fn();

    const moduleRef = await Test.createTestingModule({
      imports: [
        AuthModule.forRoot({
          loginCredentialsSchema: z.object({
            password: z.string(),
            username: z.string()
          }),
          userQuery
        }),
        ConfigModule.forRoot({
          envConfig: {
            NODE_ENV: 'test',
            SECRET_KEY: '12345678'
          } satisfies Partial<BaseEnv> as BaseEnv
        }),
        CryptoModule.forRoot(),
        LoggingModule.forRoot()
      ]
    }).compile();

    const cryptoService = moduleRef.get(CryptoService);
    hashedPassword = await cryptoService.hashPassword(loginCredentials.password);

    app = moduleRef.createNestApplication({
      logger: ['debug', 'error', 'fatal', 'log', 'verbose', 'warn']
    });
    await app.init();
    server = app.getHttpServer();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
      app.flushLogs();
    }
  });

  it('should return status code 401 if the user query returns null', async () => {
    userQuery.mockResolvedValueOnce(null);
    const response = await request(server).post('/auth/login').send(loginCredentials);
    expect(response.status).toBe(401);
    expect(userQuery).toHaveBeenCalledExactlyOnceWith(loginCredentials);
  });

  it('should return status code 401 if the hashed password is incorrect', async () => {
    const comparePassword = vi.spyOn(CryptoService.prototype, 'comparePassword');
    userQuery.mockResolvedValueOnce({ hashedPassword: '123$123' });
    const response = await request(server).post('/auth/login').send(loginCredentials);
    expect(response.status).toBe(401);
    expect(userQuery).toHaveBeenCalledExactlyOnceWith(loginCredentials);
    expect(comparePassword).toHaveBeenCalledExactlyOnceWith(loginCredentials.password, '123$123');
  });

  it('should return status code 200 and an access token if the credentials are correct', async () => {
    userQuery.mockResolvedValueOnce({ hashedPassword, tokenPayload: {} });
    const response = await request(server).post('/auth/login').send(loginCredentials);
    expect(response.status).toBe(200);
    expect(response.body).toStrictEqual({
      accessToken: expect.stringMatching(/^[A-Za-z0-9-_]+\.([A-Za-z0-9-_]+)\.[A-Za-z0-9-_]+$/)
    });
  });
});
