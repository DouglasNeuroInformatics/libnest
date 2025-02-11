import type { PrismaModelName } from './prisma.types.js';

export function getModelToken<T extends PrismaModelName>(modelName: T) {
  return modelName + 'PrismaModel';
}
