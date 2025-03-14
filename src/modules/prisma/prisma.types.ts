import type { SingleKeyMap } from '@douglasneuroinformatics/libjs';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { IfNever, Simplify } from 'type-fest';

import type { PrismaFactory } from './prisma.factory.js';

export type PrismaClientLike = PrismaClient & {
  [key: string]: any;
};

export type RuntimePrismaClient = Simplify<ReturnType<PrismaFactory['createClient']>>;

export type PrismaModelName = IfNever<Prisma.ModelName, string, Prisma.ModelName>;

export type PrismaModelKey<T extends PrismaModelName = PrismaModelName> = Uncapitalize<T>;

export type PrismaModelToken<T extends PrismaModelName> = `${T}PrismaModel`;

export type PrismaModelWhereInputMap = {
  [K in PrismaModelName]: PrismaClientLike[PrismaModelKey<K>] extends {
    findFirst: (args: { where: infer TWhereInput }) => any;
  }
    ? TWhereInput
    : never;
};

export type Model<T extends PrismaModelName> =
  RuntimePrismaClient extends SingleKeyMap<`${Uncapitalize<T>}`, infer U> ? U : never;
