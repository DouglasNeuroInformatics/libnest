import type { SingleKeyMap } from '@douglasneuroinformatics/libjs';
import type { Prisma, PrismaClient } from '@prisma/client';
import type { IfNever } from 'type-fest';

import type { ExtendedPrismaClient } from './prisma.factory.js';

export type PrismaClientLike = PrismaClient & {
  [key: string]: any;
};

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
  ExtendedPrismaClient extends SingleKeyMap<`${Uncapitalize<T>}`, infer U> ? U : never;
