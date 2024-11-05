import type { Prisma } from '@prisma/client';

export function getModelToken<T extends Prisma.ModelName>(modelName: T) {
  return modelName + 'PrismaModel';
}
