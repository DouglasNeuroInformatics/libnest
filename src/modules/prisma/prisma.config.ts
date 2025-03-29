import type { Prisma } from '@prisma/client';

import { defineToken } from '../../utils/token.utils.js';

export type PrismaModuleOptions<TPrismaClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions> =
  {
    clientOptions?: TPrismaClientOptions;
    dbPrefix: null | string;
  };

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');
