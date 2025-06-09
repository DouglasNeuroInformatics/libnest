import { Prisma } from '@prisma/client';
import type {
  Call,
  DefaultArgs,
  DynamicClientExtensionThis,
  InternalArgs,
  MergeExtArgs
} from '@prisma/client/runtime/library';

import type { ModelExtArgs, ResultExtArgs } from './prisma.extensions.js';
import type { RuntimePrismaClientOptions } from './prisma.types.js';

type InferPrismaExtensionArgs<TArgs extends { [key: string]: unknown }> = MergeExtArgs<
  Prisma.TypeMap<DefaultArgs, RuntimePrismaClientOptions['omit']>,
  {},
  InternalArgs<TArgs['result'], TArgs['model'], TArgs['query'], TArgs['client']>
>;

type InferExtendedClient<TArgs extends { [key: string]: unknown }> = DynamicClientExtensionThis<
  Call<
    Prisma.TypeMapCb<RuntimePrismaClientOptions>,
    {
      extArgs: InferPrismaExtensionArgs<TArgs>;
    }
  >,
  Prisma.TypeMapCb<RuntimePrismaClientOptions>,
  InferPrismaExtensionArgs<TArgs>
>;

export type ExtendedPrismaClient = InferExtendedClient<{ model: ModelExtArgs; result: ResultExtArgs }>;
