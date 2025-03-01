import { defineToken } from '../../utils/token.utils.js';

import type { PrismaClientLike, PrismaModelName } from './prisma.types.js';

export type PrismaModuleOptions = {
  client: PrismaClientLike;
  modelNames: PrismaModelName[];
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');
