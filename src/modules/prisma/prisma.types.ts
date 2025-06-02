import type { FallbackIfNever, SingleKeyMap } from '@douglasneuroinformatics/libjs';
import type { Prisma } from '@prisma/client';
import type { IfNever } from 'type-fest';

import type { UserConfig } from '../../user-config.js';
import type { PrismaModuleLike } from './prisma.base.js';
import type { DefaultPrismaGlobalOmitConfig } from './prisma.config.js';
import type { ExtendedPrismaClient } from './prisma.factory.js';

type RuntimePrismaModule = UserConfig extends {
  RuntimePrismaModule: infer TRuntimePrismaModule extends typeof PrismaModuleLike;
}
  ? TRuntimePrismaModule
  : typeof PrismaModuleLike;

type RuntimePrismaClient = RuntimePrismaModule['PrismaClient'];

export type PrismaModelName = FallbackIfNever<
  Extract<keyof RuntimePrismaModule['Prisma']['ModelName'], string>,
  string
>;

export type PrismaModelKey<T extends PrismaModelName = PrismaModelName> = Uncapitalize<T>;

export type PrismaModelWhereInputMap = {
  [K in PrismaModelName]: RuntimePrismaClient[PrismaModelKey<K>] extends {
    findFirst: (args: { where: infer TWhereInput }) => any;
  }
    ? TWhereInput
    : never;
};

// export type Model<T extends PrismaModelName> =
//   ExtendedPrismaClient extends SingleKeyMap<`${Uncapitalize<T>}`, infer U> ? U : never;

// export type RuntimePrismaGlobalOmitConfig = UserConfig extends {
//   PrismaGlobalOmitConfig: infer TPrismaGlobalOmitConfig extends DefaultPrismaGlobalOmitConfig;
// }
//   ? TPrismaGlobalOmitConfig
//   : DefaultPrismaGlobalOmitConfig;

// export type RuntimePrismaClientOptions = {
//   datasourceUrl: string;
//   omit: RuntimePrismaGlobalOmitConfig;
// };
