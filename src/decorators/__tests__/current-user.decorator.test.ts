import type { IncomingMessage, Server, ServerResponse } from 'http';

import { Controller, Get } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { NextFunction, Request, Response } from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';

import { CurrentUser } from '../current-user.decorator.js';

describe('CurrentUser', () => {
  let app: NestExpressApplication;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  @Controller()
  class AppController {
    @Get()
    currentUser(@CurrentUser() currentUser: { username: string }) {
      return currentUser;
    }
    @Get('username')
    currentUsername(@CurrentUser('username') username: string) {
      return username;
    }
  }

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController]
    }).compile();
    app = moduleRef.createNestApplication({
      logger: ['error', 'fatal', 'warn']
    });
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const username = req.query.username;
      if (username) {
        req.user = { username };
      }
      return next();
    });
    await app.init();
    server = app.getHttpServer();
  });

  it('should throw if the request object does not have a user property', async () => {
    const response = await request(server).get('/');
    expect(response.statusCode).toBe(500);
  });

  it('should return the entire user object when no key is provided', async () => {
    const response = await request(server).get('/?username=admin');
    expect(response.statusCode).toBe(200);
    expect(response.body).toMatchObject({ username: 'admin' });
  });

  it('should return a specific key from the user object when a key is provided', async () => {
    const response = await request(server).get('/username?username=admin');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('admin');
  });
});
