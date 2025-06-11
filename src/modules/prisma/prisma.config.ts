import type { Prisma, PrismaClient } from '@prisma/client';

import { defineToken } from '../../utils/token.utils.js';

import type { LibnestExtendedPrismaClient } from './prisma.extensions.js';
import type { InferExtendedClient } from './prisma.types.js';

export type DefaultPrismaClientOptions = Omit<Prisma.PrismaClientOptions, 'datasources' | 'datasourceUrl' | 'log'>;

export type PrismaModuleOptions<
  TPrismaClientOptions extends DefaultPrismaClientOptions = DefaultPrismaClientOptions,
  TExtendedPrismaClient extends LibnestExtendedPrismaClient = LibnestExtendedPrismaClient
> = {
  client: {
    constructor: new (options?: Prisma.PrismaClientOptions) => PrismaClient;
    extends?: (client: InferExtendedClient<NoInfer<TPrismaClientOptions>>) => TExtendedPrismaClient;
    options?: TPrismaClientOptions;
  };
  dbPrefix: null | string;
  useInMemoryDbForTesting?: boolean;
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');

export const { PRISMA_MODULE_OPTIONS_TOKEN } = defineToken('PRISMA_MODULE_OPTIONS_TOKEN');

export const { MONGO_CONNECTION_TOKEN } = defineToken('MONGO_CONNECTION_TOKEN');
