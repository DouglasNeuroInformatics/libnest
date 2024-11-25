import type { Prisma } from '@prisma/client';

import type { PrismaFactory } from './prisma.factory.js';

export type ExtendedPrismaClient = ReturnType<(typeof PrismaFactory)['createClient']>;

export type Model<T extends Prisma.ModelName> = ExtendedPrismaClient[`${Uncapitalize<T>}`];
