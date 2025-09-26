import type { SingleKeyMap } from '@douglasneuroinformatics/libjs';
import type { Prisma } from '@prisma/client';
import type { IfNever } from 'type-fest';

import type { UserTypes } from '../../user-config.js';

export type PrismaModelName = IfNever<Prisma.ModelName, string, Prisma.ModelName>;

export type PrismaModelKey<T extends PrismaModelName = PrismaModelName> = Uncapitalize<T>;

export type Model<T extends PrismaModelName> =
  UserTypes.PrismaClient extends SingleKeyMap<`${Uncapitalize<T>}`, infer U> ? U : never;
