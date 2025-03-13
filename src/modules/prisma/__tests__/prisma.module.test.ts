import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockEnvConfig } from '../../../testing/mocks/env-config.mock.js';
import { ConfigModule } from '../../config/config.module.js';
import { PRISMA_CLIENT_TOKEN } from '../prisma.config.js';
import { PrismaModule } from '../prisma.module.js';

import type { MockPrismaClientInstance } from '../../../testing/mocks/prisma.client.mock.js';

describe('PrismaModule', () => {
  describe('forRoot', () => {
    let prismaClient: MockPrismaClientInstance;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ envConfig: mockEnvConfig }),
          PrismaModule.forRoot({
            dbPrefix: null
          })
        ]
      }).compile();
      prismaClient = module.get(PRISMA_CLIENT_TOKEN);
    });

    it('should provide the correct PrismaClient', () => {
      expect(prismaClient.__isMockPrismaClient).toBe(true);
    });
  });
});
