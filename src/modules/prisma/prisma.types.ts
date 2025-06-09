import type { SingleKeyMap } from '@douglasneuroinformatics/libjs';
import type { Prisma, PrismaClient } from '@prisma/client';
import type {
  Call,
  DefaultArgs,
  DynamicClientExtensionThis,
  InternalArgs,
  MergeExtArgs
} from '@prisma/client/runtime/library';
import type { IfNever } from 'type-fest';

import type { UserConfig } from '../../user-config.js';
import type { DefaultPrismaClientOptions } from './prisma.config.js';
import type { ModelExtArgs, ResultExtArgs } from './prisma.extensions.js';

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

export type PrismaClientLike = PrismaClient & {
  [key: string]: any;
};

export type PrismaModelName = IfNever<Prisma.ModelName, string, Prisma.ModelName>;

export type PrismaModelKey<T extends PrismaModelName = PrismaModelName> = Uncapitalize<T>;

export type PrismaModelWhereInputMap = {
  [K in PrismaModelName]: PrismaClientLike[PrismaModelKey<K>] extends {
    findFirst: (args: { where: infer TWhereInput }) => any;
  }
    ? TWhereInput
    : never;
};

export type Model<T extends PrismaModelName> =
  ExtendedPrismaClient extends SingleKeyMap<`${Uncapitalize<T>}`, infer U> ? U : never;

export type RuntimePrismaClientOptions = UserConfig extends {
  RuntimePrismaClientOptions: infer TPrismaClientOptions extends DefaultPrismaClientOptions;
}
  ? TPrismaClientOptions
  : DefaultPrismaClientOptions;

export type ExtendedPrismaClient = InferExtendedClient<{ model: ModelExtArgs; result: ResultExtArgs }>;
