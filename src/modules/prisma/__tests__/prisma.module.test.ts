import { Test } from '@nestjs/testing';
import type { TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { mockEnvConfig } from '../../../testing/mocks/env-config.mock.js';
import { ConfigModule } from '../../config/config.module.js';
import { LoggingModule } from '../../logging/logging.module.js';
import { MONGO_CONNECTION_TOKEN, PRISMA_CLIENT_TOKEN } from '../prisma.config.js';
import { PrismaModule } from '../prisma.module.js';

import type { MockPrismaClientInstance } from '../../../testing/mocks/prisma.client.mock.js';
import type { MongoConnection } from '../connection.factory.js';

describe('PrismaModule', () => {
  describe('forRoot', () => {
    let prismaClient: MockPrismaClientInstance;
    let mongoConnection: MongoConnection;

    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            envConfig: {
              ...mockEnvConfig,
              MONGO_DIRECT_CONNECTION: true,
              MONGO_REPLICA_SET: 'rs0',
              MONGO_RETRY_WRITES: true,
              MONGO_WRITE_CONCERN: 'majority'
            }
          }),
          LoggingModule,
          PrismaModule.forRoot({
            dbPrefix: 'example'
          })
        ]
      }).compile();
      prismaClient = module.get(PRISMA_CLIENT_TOKEN);
      mongoConnection = module.get(MONGO_CONNECTION_TOKEN);
    });

    it('should provide the correct PrismaClient', () => {
      expect(prismaClient.__isMockPrismaClient).toBe(true);
    });

    it('should generate the correct url', () => {
      expect(mongoConnection.url.href).toBe(
        `${mockEnvConfig.MONGO_URI.href}/example-test?directConnection=true&replicaSet=rs0&retryWrites=true&w=majority`
      );
    });
  });
});
