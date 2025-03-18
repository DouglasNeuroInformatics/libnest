import { createAccessibleByFactory } from '@casl/prisma/runtime';
import { uncapitalize } from '@douglasneuroinformatics/libjs';

import type { AppAbility, AppAction, AppConditions } from '../auth/auth.config.js';
import type { PrismaModelKey, PrismaModelName, PrismaModelWhereInputMap } from './prisma.types.js';

const accessibleBy = createAccessibleByFactory<PrismaModelWhereInputMap, AppConditions>();

/**
 * Generates an injection token for a given Prisma model name.
 * @param modelName - The name of the Prisma model.
 * @returns A injection token string.
 */
export function getModelToken<T extends PrismaModelName>(modelName: T): `${T}PrismaModel` {
  return `${modelName}PrismaModel`;
}

/** return the key for a given model name on the prisma client */
export function getModelKey<T extends PrismaModelName>(modelName: T): PrismaModelKey<T> {
  return uncapitalize(modelName);
}

export function accessibleQuery<T extends PrismaModelName>(
  ability: AppAbility | undefined,
  action: AppAction,
  modelName: T
): NonNullable<PrismaModelWhereInputMap[T]> {
  if (!ability) {
    return {};
  }
  return accessibleBy(ability, action)[modelName]!;
}
