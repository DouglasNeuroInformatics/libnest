import { uncapitalize } from '@douglasneuroinformatics/libjs';

import type { PrismaModelKey, PrismaModelName, PrismaModelToken } from './prisma.types.js';

/**
 * Generates an injection token for a given Prisma model name.
 * @param modelName - The name of the Prisma model.
 * @returns A injection token string.
 */
export function getModelToken<T extends PrismaModelName>(modelName: T): PrismaModelToken<T> {
  return `${modelName}PrismaModel`;
}

/** return the key for a given model name on the prisma client */
export function getModelKey<T extends PrismaModelName>(modelName: T): PrismaModelKey<T> {
  return uncapitalize(modelName);
}
