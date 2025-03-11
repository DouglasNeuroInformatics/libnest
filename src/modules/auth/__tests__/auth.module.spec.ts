import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import { Controller, Get } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
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
import { JwtStrategy } from '../strategies/jwt.strategy.js';

import type { BaseEnv } from '../../../schemas/env.schema.js';

@Controller('cats')
class CatsController {
  @Get()
  get() {
    return {
      name: 'Winston'
    };
  }
}

describe('AuthModule', () => {
  let app: NestExpressApplication;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  let jwtStrategy: JwtStrategy;

  let userQuery: Mock;

  const loginCredentials = {
    password: 'password',
    username: 'admin'
  };

  let hashedPassword: string;
  const tokenPayload = { username: 'admin' };

  beforeAll(async () => {
    userQuery = vi.fn();

    const moduleRef = await Test.createTestingModule({
      controllers: [CatsController],
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
        CryptoModule,
        LoggingModule
      ]
    }).compile();

    const cryptoService = moduleRef.get(CryptoService);
    hashedPassword = await cryptoService.hashPassword(loginCredentials.password);

    jwtStrategy = moduleRef.get(JwtStrategy);

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

  describe('/auth/login', () => {
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
      userQuery.mockResolvedValueOnce({ hashedPassword, tokenPayload });
      const response = await request(server).post('/auth/login').send(loginCredentials);
      expect(response.status).toBe(200);
      expect(response.body).toStrictEqual({
        accessToken: expect.stringMatching(/^[A-Za-z0-9-_]+\.([A-Za-z0-9-_]+)\.[A-Za-z0-9-_]+$/)
      });
    });
  });

  describe('/cats', () => {
    describe('unauthorized', () => {
      it('should reject queries without an access token', async () => {
        const response = await request(server).get('/cats');
        expect(response.status).toBe(401);
      });
      it('should reject queries with an malformed access token', async () => {
        const response = await request(server).get('/cats').set('Authorization', 'Bearer 123$123');
        expect(response.status).toBe(401);
      });
      it('should reject queries with an access token signed with the wrong secret key', async () => {
        const accessToken = await new JwtService({ secret: 'NOT_A_SECRET' }).signAsync({});
        const response = await request(server).get('/cats').set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(401);
      });
    });
    describe('authorized', () => {
      let accessToken: string;

      beforeAll(async () => {
        userQuery.mockResolvedValueOnce({ hashedPassword, tokenPayload });
        const response = await request(server).post('/auth/login').send(loginCredentials);
        accessToken = response.body.accessToken;
      });

      it('should accept queries with the correct access token', async () => {
        const response = await request(server).get('/cats').set('Authorization', `Bearer ${accessToken}`);
        expect(response.status).toBe(200);
      });

      it('should call the jwt strategy with the payload', async () => {
        const validate = vi.spyOn(jwtStrategy, 'validate');
        await request(server).get('/cats').set('Authorization', `Bearer ${accessToken}`);
        expect(validate).toHaveBeenCalledOnce();
        expect(validate.mock.lastCall![0]).toMatchObject({
          permissions: [],
          username: 'admin'
        });
      });
    });
  });
});
