import type { Prisma } from '@prisma/client';
import type { DynamicClientExtensionThis, InternalArgs } from '@prisma/client/runtime/library';
import { beforeEach, describe, expect, expectTypeOf, it, test, vi } from 'vitest';

import { MockFactory } from '../../../../testing/index.js';
import { mockEnvConfig } from '../../../../testing/mocks/env-config.mock.js';
import { ConfigService } from '../../config/config.service.js';
import { PrismaFactory } from '../prisma.factory.js';

import type { BaseEnv } from '../../../../config/schema.js';
import type { MockedInstance } from '../../../../testing/index.js';
import type { ExtendedPrismaClient } from '../prisma.factory.js';

const { PrismaClient } = (await import(
  '@prisma/client'
)) as unknown as typeof import('../../../../testing/mocks/prisma.module.mock.js');

test('ExtendedPrismaClient', () => {
  expectTypeOf<ExtendedPrismaClient>().toMatchTypeOf<
    DynamicClientExtensionThis<
      Prisma.TypeMap<
        InternalArgs & {
          client: {};
          model: {
            $allModels: {
              readonly exists: () => <T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']) => Promise<boolean>;
            };
          };
          query: {};
          result: {};
        },
        Prisma.PrismaClientOptions
      >,
      Prisma.TypeMapCb,
      {
        client: {};
        model: {
          readonly $allModels: {
            readonly exists: () => <T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']) => Promise<boolean>;
          };
        };
        query: {};
        result: {};
      },
      Prisma.PrismaClientOptions
    >
  >();
});

describe('PrismaFactory', () => {
  let configService: MockedInstance<ConfigService>;
  let prismaFactory: PrismaFactory;

  beforeEach(() => {
    configService = MockFactory.createMock(ConfigService);
    prismaFactory = new PrismaFactory(configService as unknown as ConfigService);
  });

  it('should be defined', () => {
    expect(prismaFactory).toBeDefined();
  });

  describe('createClient', () => {
    beforeEach(() => {
      const env: BaseEnv = {
        ...mockEnvConfig,
        MONGO_DIRECT_CONNECTION: true,
        MONGO_REPLICA_SET: 'rs0',
        MONGO_RETRY_WRITES: true,
        MONGO_WRITE_CONCERN: 'majority'
      };
      configService.get.mockImplementation((key: keyof BaseEnv) => {
        return env[key];
      });
    });
    it('should instantiate the PrismaClient with the correct url', () => {
      prismaFactory.createClient({ dbPrefix: 'my-app' });
      expect(PrismaClient).toHaveBeenCalledExactlyOnceWith(
        expect.objectContaining({
          datasourceUrl:
            'mongodb://localhost:27017/my-app-test?directConnection=true&replicaSet=rs0&retryWrites=true&w=majority'
        })
      );
    });
    it('should call $extends on the PrismaClient twice', () => {
      const mockClient = {
        $extends: vi.fn().mockReturnThis()
      };
      PrismaClient.mockImplementationOnce(() => {
        return mockClient as any;
      });
      prismaFactory.createClient({ dbPrefix: 'my-app' });
      expect(mockClient);
    });
  });
});
