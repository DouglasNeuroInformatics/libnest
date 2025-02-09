import type { PrismaModelName } from '../types.js';

export function getModelToken<T extends PrismaModelName>(modelName: T) {
  return modelName + 'PrismaModel';
}
