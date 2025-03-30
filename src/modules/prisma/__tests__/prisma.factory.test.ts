import { Prisma } from '@prisma/client';
import type { DynamicClientExtensionThis, InternalArgs } from '@prisma/client/runtime/library';
import { beforeEach, describe, expect, expectTypeOf, it, test, vi } from 'vitest';

import { PrismaFactory } from '../prisma.factory.js';
import { getModelKey } from '../prisma.utils.js';

import type { ExtendedPrismaClient } from '../prisma.factory.js';
import type { RuntimePrismaClientOptions } from '../prisma.types.js';

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
        RuntimePrismaClientOptions
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
      }
    >
  >();
});

describe('PrismaFactory', () => {
  const mongoConnection = 'mongodb://localhost:27017/example-test';
  let prismaFactory: PrismaFactory;

  beforeEach(() => {
    prismaFactory = new PrismaFactory(mongoConnection);
  });

  it('should be defined', () => {
    expect(prismaFactory).toBeDefined();
  });

  it('should instantiate the PrismaClient with the correct url', () => {
    prismaFactory.createClient({});
    expect(PrismaClient).toHaveBeenCalledExactlyOnceWith({
      datasourceUrl: mongoConnection
    });
  });

  it('should correctly extend the PrismaClient', () => {
    const $extends = vi.fn();
    PrismaClient.mockImplementationOnce(() => ({ $extends }) as any);
    prismaFactory.createClient({});
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
