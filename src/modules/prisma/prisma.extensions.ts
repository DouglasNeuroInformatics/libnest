import { Prisma } from '@prisma/client';

import { getModelKey } from './prisma.utils.js';

import type { PrismaModelKey, PrismaModelName } from './prisma.types.js';

export type LibnestPrismaExtensionArgs = {
  model: {
    $allModels: {
      exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean>;
    };
  };
  result: {
    [K in PrismaModelName as PrismaModelKey<K>]: {
      __modelName: {
        compute: () => K;
      };
    };
  };
};

export const LibnestPrismaExtension = Prisma.defineExtension((client) => {
  const result = {} as LibnestPrismaExtensionArgs['result'];
  Object.keys(Prisma.ModelName).forEach((modelName) => {
    result[getModelKey(modelName)] = {
      __modelName: {
        compute: (): string => modelName
      }
    };
  });
  return client.$extends({
    model: {
      $allModels: {
        async exists<T>(this: T, where: Prisma.Args<T, 'findFirst'>['where']): Promise<boolean> {
          const context = Prisma.getExtensionContext(this) as unknown as {
            findFirst: (...args: unknown[]) => Promise<unknown>;
          };
          const result = await context.findFirst({ where });
          return result !== null;
        }
      }
    } satisfies LibnestPrismaExtensionArgs['model'],
    name: 'libnest',
    result
  });
});
