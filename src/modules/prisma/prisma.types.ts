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
import type { LibnestPrismaExtensionArgs } from './prisma.extensions.js';

type InferPrismaExtensionArgs<
  TExtension extends Partial<Prisma.Extension>,
  TClientOptions extends Prisma.PrismaClientOptions
> = MergeExtArgs<
  Prisma.TypeMap<DefaultArgs, TClientOptions['omit']>,
  {},
  InternalArgs<TExtension['result'], TExtension['model'], TExtension['query'], TExtension['client']>
>;

type InferPrismaTypeMap<
  TExtension extends Partial<Prisma.Extension>,
  TClientOptions extends Prisma.PrismaClientOptions
> = Call<
  Prisma.TypeMapCb<TClientOptions>,
  {
    extArgs: InferPrismaExtensionArgs<TExtension, TClientOptions>;
  }
>;

export type InferExtendedClient<TClientOptions extends Prisma.PrismaClientOptions> = DynamicClientExtensionThis<
  InferPrismaTypeMap<LibnestPrismaExtensionArgs, TClientOptions>,
  Prisma.TypeMapCb<TClientOptions>,
  InferPrismaExtensionArgs<LibnestPrismaExtensionArgs, TClientOptions>
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

export type ExtendedPrismaClient = InferExtendedClient<RuntimePrismaClientOptions>;
