import type { Prisma } from '@prisma/client';

import { defineToken } from '../../utils/token.utils.js';

export type DefaultPrismaGlobalOmitConfig = Prisma.GlobalOmitConfig;

export type PrismaModuleOptions<
  TGlobalOmitConfig extends DefaultPrismaGlobalOmitConfig = DefaultPrismaGlobalOmitConfig
> = {
  dbPrefix: null | string;
  omit?: TGlobalOmitConfig;
  useInMemoryDbForTesting?: boolean;
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');

export const { MONGO_CONNECTION_TOKEN } = defineToken('MONGO_CONNECTION_TOKEN');
