import { Prisma } from '@prisma/client';
import type { DynamicClientExtensionThis, InternalArgs } from '@prisma/client/runtime/library';
import { beforeEach, describe, expect, expectTypeOf, it, test, vi } from 'vitest';

import { MockFactory } from '../../../testing/index.js';
import { mockEnvConfig } from '../../../testing/mocks/env-config.mock.js';
import { ConfigService } from '../../config/config.service.js';
import { PrismaFactory } from '../prisma.factory.js';
import { getModelKey } from '../prisma.utils.js';

import type { BaseEnv } from '../../../schemas/env.schema.js';
import type { MockedInstance } from '../../../testing/index.js';
import type { ExtendedPrismaClient } from '../prisma.factory.js';

const { PrismaClient } = (await import(
  '@prisma/client'
)) as unknown as typeof import('../../../testing/mocks/prisma.module.mock.js');

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

    it('should correctly extend the PrismaClient', () => {
      const $extends = vi.fn();
      PrismaClient.mockImplementationOnce(() => ({ $extends }) as any);
      prismaFactory.createClient({ dbPrefix: 'my-app' });
      expect($extends).toHaveBeenCalledExactlyOnceWith(expect.any(Function));
      const extension = $extends.mock.lastCall![0] as (client: any) => any;
      $extends.mockReturnValueOnce('EXTENDED_CLIENT');
      expect(extension({ $extends })).toBe('EXTENDED_CLIENT');
      expect($extends).toHaveBeenCalledTimes(2);
      const extArgs = $extends.mock.lastCall![0];
      expect(extArgs).toStrictEqual({
        model: {
          $allModels: {
            exists: expect.any(Function)
          }
        },
        result: Object.fromEntries(
          Object.keys(Prisma.ModelName).map((modelName) => [
            getModelKey(modelName),
            {
              __modelName: {
                compute: expect.any(Function)
              }
            }
          ])
        )
      });
      const getExtensionContext = vi.spyOn(Prisma, 'getExtensionContext').mockImplementation(() => {
        return {
          findFirst: vi.fn()
        } as any;
      });
      const { model, result } = extArgs;
      expect(model.$allModels.exists.call({ __name: 'TEST' }));
      expect(getExtensionContext).toHaveBeenCalledExactlyOnceWith({ __name: 'TEST' });
      Object.keys(Prisma.ModelName).forEach((modelName) => {
        expect(result[getModelKey(modelName)].__modelName.compute()).toBe(modelName);
      });
    });
  });
});
