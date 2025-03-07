import type { IncomingMessage, Server, ServerResponse } from 'node:http';

import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { beforeAll, describe, expect, it } from 'vitest';

import { AuthModule } from '../auth.module.js';

describe('AuthModule', () => {
  let app: NestExpressApplication;
  let server: Server<typeof IncomingMessage, typeof ServerResponse>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AuthModule]
    }).compile();
    app = moduleRef.createNestApplication({
      logger: false
    });
    await app.init();
    server = app.getHttpServer();
  });

  it('should be defined', () => {
    expect(app).toBeDefined();
    expect(server).toBeDefined();
  });
});
