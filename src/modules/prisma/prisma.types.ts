import type { SingleKeyMap } from '@douglasneuroinformatics/libjs';
import type { Prisma } from '@prisma/client';
import type { IfNever } from 'type-fest';

import type { UserConfig } from '../../user-config.js';
import type { DefaultPrismaGlobalOmitConfig } from './prisma.config.js';
import type { ExtendedPrismaClient } from './prisma.factory.js';

export type PrismaClientLike = ExtendedPrismaClient & {
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

export type RuntimePrismaGlobalOmitConfig = UserConfig extends {
  PrismaGlobalOmitConfig: infer TPrismaGlobalOmitConfig extends DefaultPrismaGlobalOmitConfig;
}
  ? TPrismaGlobalOmitConfig
  : DefaultPrismaGlobalOmitConfig;

export type RuntimePrismaClientOptions = {
  datasourceUrl: string;
  omit: RuntimePrismaGlobalOmitConfig;
};
