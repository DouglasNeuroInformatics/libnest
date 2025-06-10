import { Prisma } from '@prisma/client';
import type { DynamicClientExtensionThis, InternalArgs } from '@prisma/client/runtime/library';
import { expectTypeOf, test } from 'vitest';

import type { RuntimePrismaClientOptions } from '../../../user-types.js';
import type { ExtendedPrismaClient } from '../prisma.types.js';

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
