import type { Prisma, PrismaClient } from '@prisma/client';
import type { DefaultArgs } from '@prisma/client/runtime/library';

import { defineToken } from '../../utils/token.utils.js';

export type DefaultPrismaClientOptions = Omit<Prisma.PrismaClientOptions, 'datasources' | 'datasourceUrl' | 'log'>;

export type PrismaModuleOptions<TPrismaClientOptions extends DefaultPrismaClientOptions = DefaultPrismaClientOptions> =
  {
    client: {
      constructor: new () => PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>;
      options?: TPrismaClientOptions;
    };
    dbPrefix: null | string;
    useInMemoryDbForTesting?: boolean;
  };

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');

export const { PRISMA_MODULE_OPTIONS_TOKEN } = defineToken('PRISMA_MODULE_OPTIONS_TOKEN');

export const { MONGO_CONNECTION_TOKEN } = defineToken('MONGO_CONNECTION_TOKEN');
