import type { Prisma } from '@prisma/client';
import { PrismaClient } from '@prisma/client/extension';
import type { DynamicClientExtensionThis, InternalArgs } from '@prisma/client/runtime/library';
import { expectTypeOf, test } from 'vitest';

import type { ExtendedPrismaClient } from '../prisma.factory.js';

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
  expectTypeOf<PrismaClient>().toMatchTypeOf<ExtendedPrismaClient>();
});
