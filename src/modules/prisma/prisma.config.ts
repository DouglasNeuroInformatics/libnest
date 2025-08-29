import { ConfigurableModuleBuilder } from '@nestjs/common';
import type { Prisma, PrismaClient } from '@prisma/client';

import { defineToken } from '../../utils/token.utils.js';

export type DefaultPrismaClientOptions = Omit<Prisma.PrismaClientOptions, 'datasources' | 'datasourceUrl' | 'log'>;

export type PrismaModuleOptions<> = {
  client: PrismaClient;
};

export const { PRISMA_CLIENT_TOKEN } = defineToken('PRISMA_CLIENT_TOKEN');

export const { ConfigurableModuleClass: ConfigurablePrismaModule, MODULE_OPTIONS_TOKEN: PRISMA_MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<PrismaModuleOptions>().setClassMethodName('forRoot').build();
