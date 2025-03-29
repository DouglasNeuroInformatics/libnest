import type { Prisma } from '@prisma/client';

import { defineToken } from '../../utils/token.utils.js';

export type BasePrismaClientOptions = Omit<Prisma.PrismaClientOptions, 'datasources' | 'datasourceUrl'>;

export type PrismaModuleOptions<TPrismaClientOptions extends BasePrismaClientOptions = BasePrismaClientOptions> = {
  clientOptions?: TPrismaClientOptions;
  dbPrefix: null | string;
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');
