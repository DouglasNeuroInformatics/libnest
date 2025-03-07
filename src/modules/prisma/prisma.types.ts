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

export type Model<T extends PrismaModelName> =
  RuntimePrismaClient extends SingleKeyMap<`${Uncapitalize<T>}`, infer U> ? U : never;

export type UserModelMap = {
  [K in keyof Prisma.TypeMap['model'] as Prisma.TypeMap['model'][K]['fields'] extends {
    hashedPassword: Prisma.FieldRef<K, 'String'>;
  }
    ? K
    : never]: Prisma.TypeMap['model'][K];
};
